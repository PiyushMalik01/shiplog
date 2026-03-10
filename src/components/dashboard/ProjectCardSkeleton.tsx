export default function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between mb-1">
          <div className="h-5 w-3/5 rounded-lg skeleton-shimmer" />
          <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
        </div>
        <div className="flex items-center gap-2 mb-3 mt-1.5">
          <div className="h-3 w-1/4 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-12 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-3 w-full rounded-lg skeleton-shimmer mb-1.5" />
        <div className="h-3 w-2/3 rounded-lg skeleton-shimmer mb-4" />
        <div className="h-2.5 w-20 rounded skeleton-shimmer mb-4" />
        <div className="pt-3 border-t border-[#f1f5f9] flex gap-2">
          <div className="flex-1 h-10 rounded-xl skeleton-shimmer" />
          <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
          <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
