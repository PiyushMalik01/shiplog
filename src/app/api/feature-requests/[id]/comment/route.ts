import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await req.json()

  if (!body.body?.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
  }

  // If the poster is authenticated (admin), mark the comment
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user

  const { data, error } = await supabase.from('comments').insert({
    feature_request_id: id,
    author_name: isAdmin ? 'Admin' : (body.author_name?.trim() || 'Anonymous'),
    body: body.body.trim(),
    is_admin: isAdmin,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('feature_request_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE a single comment (admin only) — pass ?comment_id=uuid
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const commentId = req.nextUrl.searchParams.get('comment_id')
  if (!commentId) return NextResponse.json({ error: 'comment_id is required' }, { status: 400 })

  const { id: requestId } = await params

  // Verify the comment belongs to this request and the user owns the project
  const { data: comment } = await supabase
    .from('comments')
    .select('id, feature_requests!inner(project_id, projects!inner(user_id))')
    .eq('id', commentId)
    .eq('feature_request_id', requestId)
    .single()

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectOwner = ((comment.feature_requests as any).projects as { user_id: string }).user_id
  if (projectOwner !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

