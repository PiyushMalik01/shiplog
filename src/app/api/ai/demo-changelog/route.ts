import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { CHANGELOG_SYSTEM_PROMPT, changelogUserPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const { raw_input } = await req.json()
    if (!raw_input?.trim()) return NextResponse.json({ error: 'raw_input is required' }, { status: 400 })
    if (raw_input.length > 1000) return NextResponse.json({ error: 'Input too long (max 1000 characters)' }, { status: 400 })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CHANGELOG_SYSTEM_PROMPT },
        { role: 'user', content: changelogUserPrompt('My Product', raw_input) },
      ],
    })

    const result = JSON.parse(completion.choices[0].message.content!)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Demo changelog error:', err)
    return NextResponse.json({ error: 'Failed to generate. Please try again.' }, { status: 500 })
  }
}
