import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { CLUSTER_SYSTEM_PROMPT, clusterUserPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { requests, project_name, project_id } = await req.json()
    if (!requests?.length) return NextResponse.json({ error: 'No requests provided' }, { status: 400 })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CLUSTER_SYSTEM_PROMPT },
        { role: 'user', content: clusterUserPrompt(project_name, requests) }
      ]
    })

    const { clusters } = JSON.parse(completion.choices[0].message.content!)

    // Filter out request IDs that are already clustered (defensive server-side guard)
    const allRequestIds = clusters.flatMap((c: { request_ids: string[] }) => c.request_ids)
    const { data: alreadyClustered } = await supabase
      .from('feature_requests')
      .select('id')
      .in('id', allRequestIds)
      .not('cluster_id', 'is', null)
    const alreadyClusteredIds = new Set((alreadyClustered ?? []).map((r: { id: string }) => r.id))

    // Persist clusters as roadmap items and link feature requests
    for (const cluster of clusters) {
      const freshIds = (cluster.request_ids as string[]).filter((id: string) => !alreadyClusteredIds.has(id))
      if (freshIds.length === 0) continue  // all already clustered, skip

      const { data: roadmapItem } = await supabase.from('roadmap_items').insert({
        project_id,
        title: cluster.label,
        ai_summary: cluster.summary,
        vote_total: cluster.total_votes,
        priority: Math.round((100 - cluster.priority_score) / 10),
        status: 'planned'
      }).select().single()

      if (roadmapItem) {
        await supabase.from('feature_requests')
          .update({ cluster_id: roadmapItem.id, status: 'planned' })
          .in('id', freshIds)
      }
    }

    return NextResponse.json({ clusters, message: `${clusters.length} roadmap items created` })
  } catch (err) {
    console.error('AI cluster error:', err)
    return NextResponse.json({ error: 'Failed to cluster requests. Please try again.' }, { status: 500 })
  }
}
