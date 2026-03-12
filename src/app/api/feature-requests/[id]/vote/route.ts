import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: existing, error: existingError } = await supabase
    .from('feature_requests')
    .select('id, vote_count')
    .eq('id', id)
    .single()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'request_not_found' }, { status: 404 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? ''
  const fingerprint = createHash('sha256').update(ip + ua).digest('hex')

  // Insert vote (unique constraint handles dedup)
  const { error: voteError } = await supabase.from('votes').insert({
    feature_request_id: id,
    voter_fingerprint: fingerprint,
  })

  if (voteError?.code === '23505') {
    return NextResponse.json({ error: 'already_voted', vote_count: existing.vote_count }, { status: 409 })
  }
  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 })

  // Atomic increment via DB function (avoids read-then-write race condition)
  const { error: incrementError } = await supabase.rpc('increment_vote_count', { request_id: id })
  if (incrementError) {
    // Fallback for environments where the RPC function wasn't applied yet.
    const { error: fallbackError } = await supabase
      .from('feature_requests')
      .update({ vote_count: existing.vote_count + 1 })
      .eq('id', id)

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }
  }

  const { data: updated, error: updatedError } = await supabase
    .from('feature_requests')
    .select('vote_count')
    .eq('id', id)
    .single()

  if (updatedError || !updated) {
    return NextResponse.json({ success: true, vote_count: existing.vote_count + 1 })
  }

  return NextResponse.json({ success: true, vote_count: updated.vote_count })
}
