import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import DotCursorGlow from '@/components/landing/DotCursorGlow'
import ProblemSection from '@/components/landing/ProblemSection'
import AIMagicSection from '@/components/landing/AIMagicSection'
import HowItWorks from '@/components/landing/HowItWorks'
import FeatureGrid from '@/components/landing/FeatureGrid'
import CTABanner from '@/components/landing/CTABanner'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="bg-[#e0f7ff]">
      <DotCursorGlow />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <AIMagicSection />
      <HowItWorks />
      <FeatureGrid />
      <CTABanner />
      <Footer />
    </main>
  )
}

