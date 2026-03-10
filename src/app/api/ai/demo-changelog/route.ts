import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { CHANGELOG_SYSTEM_PROMPT, changelogUserPrompt } from '@/lib/prompts'

// Simple in-memory rate limiter — 5 requests / IP / hour
// Works per serverless instance; sufficient to prevent casual abuse on landing page demo.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false // not limited
  }
  if (entry.count >= RATE_LIMIT_MAX) return true // limited
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      )
    }

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
