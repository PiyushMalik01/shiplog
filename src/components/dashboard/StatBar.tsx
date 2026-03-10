import { TrendingUp, Clock, Zap } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  accentColor: string
  lightColor: string
}

function StatCard({ label, value, sub, icon, accentColor, lightColor }: StatCardProps) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl border border-[#e2e8f0] dark:border-white/8 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-5 relative overflow-hidden bg-white dark:bg-[#0d1b2e]"
    >
      {/* Ghost large number watermark */}
      <span
        className="absolute -right-3 -bottom-4 text-[80px] font-extrabold select-none pointer-events-none leading-none"
        style={{
          color: accentColor,
          opacity: 0.05,
          fontFamily: 'var(--font-syne), Syne, sans-serif',
        }}
        aria-hidden
      >
        {value}
      </span>

      {/* Icon circle */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: lightColor, border: `1.5px solid ${accentColor}28` }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>

      {/* Data */}
      <p
        className="text-4xl font-extrabold text-[#03045e] dark:text-white leading-none mb-1"
        style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
      >
        {value}
      </p>
      <p className="text-[12px] font-semibold text-[#03045e] dark:text-slate-300 mb-0.5" style={{ letterSpacing: '-0.01em' }}>
        {label}
      </p>
      <p className="text-[11px] text-[#94a3b8] dark:text-slate-500">{sub}</p>
    </div>
  )
}

export default function StatBar({
  publishedUpdates = 0,
  pendingRequests = 0,
  totalProjects = 0,
}: {
  publishedUpdates?: number
  pendingRequests?: number
  totalProjects?: number
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <StatCard
        label="Published Updates"
        value={publishedUpdates}
        sub="changelog entries live"
        icon={<Zap className="w-5 h-5" />}
        accentColor="#0077b6"
        lightColor="rgba(0, 119, 182, 0.12)"
      />
      <StatCard
        label="Pending Requests"
        value={pendingRequests}
        sub="awaiting your review"
        icon={<Clock className="w-5 h-5" />}
        accentColor="#d97706"
        lightColor="rgba(245, 158, 11, 0.12)"
      />
      <StatCard
        label="Total Projects"
        value={totalProjects}
        sub="active workspaces"
        icon={<TrendingUp className="w-5 h-5" />}
        accentColor="#16a34a"
        lightColor="rgba(22, 163, 74, 0.12)"
      />
    </div>
  )
}
