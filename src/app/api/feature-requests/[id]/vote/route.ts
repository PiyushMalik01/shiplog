import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? ''
  const fingerprint = createHash('sha256').update(ip + ua).digest('hex')

  // Insert vote (unique constraint handles dedup)
  const { error: voteError } = await supabase.from('votes').insert({
    feature_request_id: id,
    voter_fingerprint: fingerprint,
  })

  if (voteError?.code === '23505') {
    return NextResponse.json({ error: 'already_voted' }, { status: 409 })
  }
  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 })

  // Atomic increment via DB function (avoids read-then-write race condition)
  await supabase.rpc('increment_vote_count', { request_id: id })

  return NextResponse.json({ success: true })
}
