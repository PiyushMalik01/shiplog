import Link from 'next/link'

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden py-24 px-6 md:px-16">
      {/* Animated shimmer bg */}
      <div className="shimmer-bg absolute inset-0" />
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2
          className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Ready to ship with clarity?
        </h2>
        <p className="text-[#90e0ef] text-lg mb-10">
          Join indie makers who stopped writing updates and started building.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2 bg-[#00b4d8] text-[#03045e] font-bold px-10 py-4 rounded-xl text-base cursor-pointer transition-all duration-200 hover:bg-[#caf0f8] hover:shadow-[0_0_32px_rgba(0,180,216,0.5)] hover:-translate-y-0.5"
        >
          Start for free →
        </Link>
        <p className="mt-6 text-[#90e0ef]/70 text-sm">No credit card required</p>
      </div>
    </section>
  )
}
