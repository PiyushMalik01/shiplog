import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const project_id = req.nextUrl.searchParams.get('project_id')
  const isPublic = req.nextUrl.searchParams.get('public') === 'true'

  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  let query = supabase.from('changelog_entries')
    .select('*')
    .eq('project_id', project_id)
    .order('created_at', { ascending: false })

  if (isPublic) query = query.eq('is_published', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('changelog_entries').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
