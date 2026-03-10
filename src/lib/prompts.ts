export const CHANGELOG_SYSTEM_PROMPT = `You are ShipLog's AI changelog writer. Your job is to transform raw developer notes — messy commit messages, bullet points, or shorthand — into polished, user-friendly changelog entries for a SaaS product.

Rules:
1. Write from the USER's perspective, not the developer's
2. Be concise but clear — one sentence per item max
3. Avoid technical jargon unless unavoidable
4. Categorize every item into exactly one of: new, improved, fixed
5. Merge very similar items into one entry
6. Generate a short, catchy title for this release
7. Return ONLY valid JSON — no markdown, no preamble, no explanation`

export function changelogUserPrompt(projectName: string, rawInput: string) {
  return `Product: ${projectName}

Raw input from the developer:
---
${rawInput}
---

Return a JSON object with this exact shape:
{
  "title": "Short release title",
  "new": ["User-facing description of new feature"],
  "improved": ["User-facing description of improvement"],
  "fixed": ["User-facing description of bug fix"]
}
Arrays can be empty [] if no items in that category.`
}

export const CLUSTER_SYSTEM_PROMPT = `You are a product strategist AI. Analyze a list of user feature requests and cluster them into logical, actionable roadmap themes. Rank clusters by priority based on vote counts and strategic value.

Rules:
1. Group semantically similar requests — even if phrased differently
2. Give each cluster a short, clear label (2-4 words)
3. Write a 1-2 sentence summary of what users want in each cluster
4. Calculate a priority_score 0-100 factoring in vote totals
5. Return ONLY valid JSON — no markdown, no preamble`

export function clusterUserPrompt(projectName: string, requests: object[]) {
  return `Feature requests for ${projectName}:
${JSON.stringify(requests, null, 2)}

Return:
{
  "clusters": [
    {
      "label": "Short Theme Name",
      "summary": "What users are asking for and why it matters",
      "request_ids": ["uuid1", "uuid2"],
      "total_votes": 45,
      "priority_score": 87
    }
  ]
}`
}

export const PRIORITY_SYSTEM_PROMPT = `You are a product prioritization expert. Given roadmap items with vote counts and descriptions, suggest an optimal priority ordering. Consider: user demand (votes), effort implied by description, strategic value. Return ONLY valid JSON.`

export function priorityUserPrompt(projectName: string, items: object[]) {
  return `Roadmap items for ${projectName}:
${JSON.stringify(items, null, 2)}

Return: { "ordered_ids": ["uuid_highest_priority", "..."], "reasoning": "brief explanation" }`
}
