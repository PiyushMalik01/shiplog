import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH — update status (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Verify user owns the project this request belongs to
  const { data: request } = await supabase
    .from('feature_requests')
    .select('project_id, projects!inner(user_id)')
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!request || (request.projects as any as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('feature_requests')
    .update({ status: body.status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remove the feature request entirely (admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership before deleting
  const { data: request } = await supabase
    .from('feature_requests')
    .select('project_id, projects!inner(user_id)')
    .eq('id', id)
    .single()

  if (!request || (request.projects as any as { user_id: string }).user_id !== user.id) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.from('feature_requests').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
