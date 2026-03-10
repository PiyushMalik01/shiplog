export const SITE = {
  name:     'ShipLog',
  tagline:  'Ship faster. Communicate better.',
  description: 'Turn messy developer notes into polished, user-facing changelogs in seconds with AI.',
  url:      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  emoji:    '🚢',
  author:   'Piyush Malik',
  builtFor: 'AGIREADY.io Hiring Drive 2026',
  github:   'https://github.com/piyushmalik',
  twitter:  'https://twitter.com/piyushmalik',
}

export const NAV_LINKS = [
  { label: 'Features',  href: '/#features' },
  { label: 'Changelog', href: '/#changelog' },
  { label: 'Roadmap',   href: '/#roadmap' },
]

export const BADGE_LABELS = {
  new:         '✦ New',
  improved:    '↑ Improved',
  fixed:       '✓ Fixed',
  planned:     'Planned',
  in_progress: 'In Progress',
  done:        'Done',
}

export const KANBAN_COLUMNS = [
  { id: 'planned',     label: 'Planned',     color: '#f59e0b' },
  { id: 'in_progress', label: 'In Progress', color: '#00b4d8' },
  { id: 'done',        label: 'Done',        color: '#22c55e' },
] as const

export const AI_CATEGORIES = ['new', 'improved', 'fixed'] as const
export type AICategory = typeof AI_CATEGORIES[number]
