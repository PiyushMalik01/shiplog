import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { SOCIAL_POSTS_SYSTEM_PROMPT, socialPostsUserPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { project_name, title, items } = await req.json()
    if (!title?.trim() || !items)
      return NextResponse.json({ error: 'title and items are required' }, { status: 400 })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SOCIAL_POSTS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: socialPostsUserPrompt(project_name || 'Product', title, items),
        },
      ],
    })

    const result = JSON.parse(completion.choices[0].message.content!)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Social posts error:', err)
    return NextResponse.json(
      { error: 'Failed to generate social posts. Please try again.' },
      { status: 500 }
    )
  }
}
