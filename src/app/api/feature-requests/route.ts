import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const project_id = req.nextUrl.searchParams.get('project_id')
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('feature_requests')
    .select('*')
    .eq('project_id', project_id)
    .order('vote_count', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  if (!body.project_id || !body.title?.trim()) {
    return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 })
  }

  const { data, error } = await supabase.from('feature_requests').insert({
    project_id: body.project_id,
    title: body.title.trim(),
    description: body.description?.trim() || null,
    submitter_email: body.submitter_email?.trim() || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
