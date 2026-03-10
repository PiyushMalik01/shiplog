export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  is_public: boolean
  created_at: string
}

export interface ChangelogContent {
  new: string[]
  improved: string[]
  fixed: string[]
}

export interface ChangelogEntry {
  id: string
  project_id: string
  version: string | null
  title: string
  raw_input: string | null
  content: ChangelogContent
  is_published: boolean
  published_at: string | null
  created_at: string
}

export interface FeatureRequest {
  id: string
  project_id: string
  title: string
  description: string | null
  vote_count: number
  status: 'open' | 'planned' | 'in_progress' | 'done'
  cluster_id: string | null
  submitter_email: string | null
  created_at: string
}

export interface RoadmapItem {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'planned' | 'in_progress' | 'done'
  ai_summary: string | null
  priority: number
  vote_total: number
  position: number
  created_at: string
}

export interface Comment {
  id: string
  feature_request_id: string
  author_name: string | null
  body: string
  created_at: string
}

// AI response shapes
export interface AIChangelogResponse {
  title: string
  new: string[]
  improved: string[]
  fixed: string[]
}

export interface AICluster {
  label: string
  summary: string
  request_ids: string[]
  total_votes: number
  priority_score: number
}

export interface AIClusterResponse {
  clusters: AICluster[]
}

export interface AIPriorityResponse {
  ordered_ids: string[]
  reasoning: string
}
