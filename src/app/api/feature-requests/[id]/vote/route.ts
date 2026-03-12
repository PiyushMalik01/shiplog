import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) return null

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const privileged = createPrivilegedClient() ?? supabase
  const { id } = await params

  let action: 'toggle' | 'add' | 'remove' = 'toggle'
  try {
    const body = await req.json()
    if (body?.action === 'add' || body?.action === 'remove' || body?.action === 'toggle') {
      action = body.action
    }
  } catch {
    // Body is optional; default to toggle behavior.
  }

  const { data: existing, error: existingError } = await supabase
    .from('feature_requests')
    .select('id, vote_count, cluster_id')
    .eq('id', id)
    .single()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  }

  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const ua = req.headers.get('user-agent') ?? ''
  const fingerprint = createHash('sha256').update(ip + ua).digest('hex')

  const { data: existingVote } = await privileged
    .from('votes')
    .select('id')
    .eq('feature_request_id', id)
    .eq('voter_fingerprint', fingerprint)
    .maybeSingle()

  const shouldRemove = action === 'remove' || (action === 'toggle' && !!existingVote)
  const shouldAdd = action === 'add' || (action === 'toggle' && !existingVote)

  if (shouldAdd) {
    // Insert vote (unique constraint handles dedup)
    const { error: voteError } = await privileged.from('votes').insert({
      feature_request_id: id,
      voter_fingerprint: fingerprint,
    })

    if (voteError?.code === '23505') {
      const { data: current } = await privileged
        .from('feature_requests')
        .select('vote_count')
        .eq('id', id)
        .single()

      return NextResponse.json({ success: true, voted: true, vote_count: current?.vote_count ?? existing.vote_count })
    }
    if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 })

    // Atomic increment via DB function (avoids read-then-write race condition)
    const { error: incrementError } = await privileged.rpc('increment_vote_count', { request_id: id })
    if (incrementError) {
      // Fallback for environments where the RPC function wasn't applied yet.
      const { data: current } = await privileged
        .from('feature_requests')
        .select('vote_count')
        .eq('id', id)
        .single()

      const safeNext = (current?.vote_count ?? existing.vote_count) + 1
      const { error: fallbackError } = await privileged
        .from('feature_requests')
        .update({ vote_count: safeNext })
        .eq('id', id)

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }
    }
  }

  if (shouldRemove) {
    const { data: removedVotes, error: removeVoteError } = await privileged
      .from('votes')
      .delete()
      .eq('feature_request_id', id)
      .eq('voter_fingerprint', fingerprint)
      .select('id')

    if (removeVoteError) {
      return NextResponse.json({ error: removeVoteError.message }, { status: 500 })
    }

    if ((removedVotes ?? []).length > 0) {
      const { data: current } = await privileged
        .from('feature_requests')
        .select('vote_count')
        .eq('id', id)
        .single()

      const safeNext = Math.max(0, (current?.vote_count ?? existing.vote_count) - 1)
      const { error: decrementError } = await privileged
        .from('feature_requests')
        .update({ vote_count: safeNext })
        .eq('id', id)

      if (decrementError) {
        return NextResponse.json({ error: decrementError.message }, { status: 500 })
      }
    }
  }

  const { data: updated, error: updatedError } = await supabase
    .from('feature_requests')
    .select('vote_count')
    .eq('id', id)
    .single()

  // Keep roadmap aggregate in sync so vote totals reflect immediately across dashboard views.
  if (existing.cluster_id) {
    const { data: clusterRequests } = await privileged
      .from('feature_requests')
      .select('vote_count')
      .eq('cluster_id', existing.cluster_id)

    const clusterVoteTotal = (clusterRequests ?? []).reduce((sum, r) => sum + (r.vote_count ?? 0), 0)

    await privileged
      .from('roadmap_items')
      .update({ vote_total: clusterVoteTotal })
      .eq('id', existing.cluster_id)
  }

  if (updatedError || !updated) {
    const votedState = shouldAdd ? true : shouldRemove ? false : !!existingVote
    return NextResponse.json({ success: true, voted: votedState, vote_count: existing.vote_count })
  }

  const votedState = shouldAdd ? true : shouldRemove ? false : !!existingVote
  return NextResponse.json({ success: true, voted: votedState, vote_count: updated.vote_count })
}
