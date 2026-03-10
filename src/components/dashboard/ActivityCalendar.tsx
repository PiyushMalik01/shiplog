'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ScrollText, GitBranch, Flame, CalendarDays, BarChart3, TrendingUp } from 'lucide-react'

interface RecentItem {
  type: 'changelog' | 'request'
  title: string
  date: string
}

export default function ActivityCalendar({ projectIds }: { projectIds: string[] }) {
  const [activityMap, setActivityMap] = useState<Record<string, number>>({})
  const [changelogCount, setChangelogCount] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!projectIds.length) {
      setLoading(false)
      return
    }

    async function load() {
      const since = new Date()
      since.setDate(since.getDate() - 70)
      const sinceStr = since.toISOString()

      const [{ data: entries }, { data: requests }] = await Promise.all([
        supabase
          .from('changelog_entries')
          .select('title, published_at')
          .in('project_id', projectIds)
          .eq('is_published', true)
          .gte('published_at', sinceStr)
          .order('published_at', { ascending: false }),
        supabase
          .from('feature_requests')
          .select('title, created_at')
          .in('project_id', projectIds)
          .gte('created_at', sinceStr)
          .order('created_at', { ascending: false }),
      ])

      const safeEntries = entries ?? []
      const safeRequests = requests ?? []

      setChangelogCount(safeEntries.length)
      setRequestCount(safeRequests.length)

      const map: Record<string, number> = {}
      safeEntries.forEach(e => {
        if (!e.published_at) return
        const d = e.published_at.slice(0, 10)
        map[d] = (map[d] ?? 0) + 2
      })
      safeRequests.forEach(r => {
        const d = r.created_at.slice(0, 10)
        map[d] = (map[d] ?? 0) + 1
      })
      setActivityMap(map)

      const merged: RecentItem[] = [
        ...safeEntries.slice(0, 5).map(e => ({
          type: 'changelog' as const,
          title: e.title,
          date: e.published_at ?? '',
        })),
        ...safeRequests.slice(0, 5).map(r => ({
          type: 'request' as const,
          title: r.title,
          date: r.created_at,
        })),
      ]
        .filter(x => x.date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      setRecent(merged)
      setLoading(false)
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIds.join(',')])

  // Build heatmap grid: Sunday 9 weeks ago through today
  const weeks: string[][] = useMemo(() => {
    const today = new Date()
    const dow = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - dow - 7 * 9)

    const cells: string[] = []
    const d = new Date(start)
    while (d <= today) {
      cells.push(d.toISOString().slice(0, 10))
      d.setDate(d.getDate() + 1)
    }

    const result: string[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7)
      while (week.length < 7) week.push('')
      result.push(week)
    }
    return result
  }, [])

  // Compute streak & active days
  const { streak, activeDays, busiestDay } = useMemo(() => {
    const today = new Date()
    let currentStreak = 0
    const d = new Date(today)

    // Walk backwards from today counting consecutive active days
    while (true) {
      const key = d.toISOString().slice(0, 10)
      if (activityMap[key] && activityMap[key] > 0) {
        currentStreak++
        d.setDate(d.getDate() - 1)
      } else {
        // Allow today to be empty — check if yesterday started streak
        if (currentStreak === 0) {
          d.setDate(d.getDate() - 1)
          const yKey = d.toISOString().slice(0, 10)
          if (activityMap[yKey] && activityMap[yKey] > 0) {
            currentStreak++
            d.setDate(d.getDate() - 1)
            while (true) {
              const k = d.toISOString().slice(0, 10)
              if (activityMap[k] && activityMap[k] > 0) {
                currentStreak++
                d.setDate(d.getDate() - 1)
              } else break
            }
          }
        }
        break
      }
    }

    const active = Object.keys(activityMap).filter(k => activityMap[k] > 0).length
    let busiest = ''
    let maxVal = 0
    for (const [k, v] of Object.entries(activityMap)) {
      if (v > maxVal) { maxVal = v; busiest = k }
    }

    return { streak: currentStreak, activeDays: active, busiestDay: busiest }
  }, [activityMap])

  function cellBg(dateStr: string) {
    if (!dateStr) return 'opacity-0'
    const v = activityMap[dateStr] ?? 0
    if (v === 0) return 'bg-[#f1f5f9]'
    if (v === 1) return 'bg-[#90e0ef]'
    if (v === 2) return 'bg-[#00b4d8]'
    if (v <= 4) return 'bg-[#0077b6]'
    return 'bg-[#023e8a]'
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function formatBusiest(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-3">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: Flame, label: 'Streak', value: `${streak}d`, color: '#f59e0b', bg: '#fffbeb' },
          { icon: CalendarDays, label: 'Active days', value: String(activeDays), color: '#0077b6', bg: '#eff8ff' },
          { icon: BarChart3, label: 'Changelogs', value: String(changelogCount), color: '#0077b6', bg: '#eff8ff' },
          { icon: TrendingUp, label: 'Requests', value: String(requestCount), color: '#16a34a', bg: '#f0fdf4' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[#e2e8f0] p-3 flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[16px] font-extrabold text-[#03045e] leading-none"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                {value}
              </p>
              <p className="text-[9px] text-[#94a3b8] font-semibold uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-bold text-[#03045e] text-[13px]"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            Contribution Graph
          </h3>
          <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">10 weeks</span>
        </div>

        {loading ? (
          <div className="h-[86px] rounded-xl bg-[#f1f5f9] animate-pulse" />
        ) : (
          <>
            <div className="flex gap-[3px] overflow-x-auto">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-[2px] flex-shrink-0">
                {['', 'M', '', 'W', '', 'F', ''].map((l, i) => (
                  <span key={i} className="h-[11px] w-3 text-[8px] text-[#94a3b8] font-medium flex items-center justify-end leading-none">
                    {l}
                  </span>
                ))}
              </div>
              {/* Week columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((dateStr, di) => (
                    <div
                      key={di}
                      title={
                        dateStr && activityMap[dateStr]
                          ? `${formatDate(dateStr)}: ${activityMap[dateStr]} event${activityMap[dateStr] !== 1 ? 's' : ''}`
                          : dateStr ? `${formatDate(dateStr)}: No activity` : undefined
                      }
                      className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-150 hover:ring-2 hover:ring-[#0077b6]/20 cursor-default ${cellBg(dateStr)}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend + busiest day */}
            <div className="flex items-center justify-between mt-2.5 flex-wrap gap-1">
              <div className="flex items-center gap-[3px]">
                <span className="text-[8px] text-[#94a3b8] mr-0.5">Less</span>
                {['bg-[#f1f5f9]', 'bg-[#90e0ef]', 'bg-[#00b4d8]', 'bg-[#0077b6]', 'bg-[#023e8a]'].map((c, i) => (
                  <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${c}`} />
                ))}
                <span className="text-[8px] text-[#94a3b8] ml-0.5">More</span>
              </div>
              {busiestDay && (
                <span className="text-[8px] text-[#94a3b8]">
                  Busiest: <span className="font-semibold text-[#64748b]">{formatBusiest(busiestDay)}</span>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4">
        <h3
          className="font-bold text-[#03045e] text-[13px] mb-3"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Recent Activity
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl flex-shrink-0 bg-[#f1f5f9] animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#f1f5f9] rounded animate-pulse" />
                  <div className="h-2.5 bg-[#f1f5f9] rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-4">
            <CalendarDays className="w-6 h-6 text-[#e2e8f0] mx-auto mb-2" />
            <p className="text-[11px] text-[#94a3b8]">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recent.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 group/item">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    item.type === 'changelog' ? 'bg-[#eff8ff] group-hover/item:bg-[#dbeafe]' : 'bg-[#f0fdf4] group-hover/item:bg-[#dcfce7]'
                  }`}
                >
                  {item.type === 'changelog' ? (
                    <ScrollText className="w-3.5 h-3.5 text-[#0077b6]" />
                  ) : (
                    <GitBranch className="w-3.5 h-3.5 text-[#16a34a]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#03045e] truncate leading-tight">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide ${
                        item.type === 'changelog' ? 'text-[#0077b6]' : 'text-[#16a34a]'
                      }`}
                    >
                      {item.type === 'changelog' ? 'Update' : 'Request'}
                    </span>
                    <span className="w-0.5 h-0.5 rounded-full bg-[#cbd5e1]" />
                    <span className="text-[9px] text-[#94a3b8]">{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
