import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { EMAIL_SYSTEM_PROMPT, emailUserPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { project_id, project_name } = await req.json()
    if (!project_id) return NextResponse.json({ error: 'project_id is required' }, { status: 400 })

    // Verify the user owns this project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Fetch the 5 most recent published changelog entries
    const { data: entries } = await supabase
      .from('changelog_entries')
      .select('title, version, content, published_at, created_at')
      .eq('project_id', project_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'No published changelog entries found. Publish at least one entry to generate an email draft.' },
        { status: 422 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: EMAIL_SYSTEM_PROMPT },
        { role: 'user', content: emailUserPrompt(project_name || 'Product', entries) },
      ],
    })

    const result = JSON.parse(completion.choices[0].message.content!)
    return NextResponse.json(result)
  } catch (err) {
    console.error('AI email generation error:', err)
    return NextResponse.json({ error: 'Failed to generate email draft. Please try again.' }, { status: 500 })
  }
}
