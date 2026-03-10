import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { PRIORITY_SYSTEM_PROMPT, priorityUserPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items, project_name } = await req.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PRIORITY_SYSTEM_PROMPT },
        { role: 'user', content: priorityUserPrompt(project_name, items) }
      ]
    })

    const { ordered_ids, reasoning } = JSON.parse(completion.choices[0].message.content!)

    // Update priority positions in DB
    for (let i = 0; i < ordered_ids.length; i++) {
      await supabase.from('roadmap_items').update({ priority: i }).eq('id', ordered_ids[i])
    }

    return NextResponse.json({ ordered_ids, reasoning })
  } catch (err) {
    console.error('AI priority error:', err)
    return NextResponse.json({ error: 'Failed to suggest priority. Please try again.' }, { status: 500 })
  }
}
