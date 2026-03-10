import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { SHIP_IT_SYSTEM_PROMPT, shipItUserPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id, project_name, item_title, raw_notes } = await req.json()
  if (!project_id || !item_title || !raw_notes?.trim()) {
    return NextResponse.json({ error: 'project_id, item_title and raw_notes are required' }, { status: 400 })
  }

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', project_id)
    .single()

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SHIP_IT_SYSTEM_PROMPT },
        { role: 'user', content: shipItUserPrompt(project_name ?? 'Your Product', item_title, raw_notes) },
      ],
    })
    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
