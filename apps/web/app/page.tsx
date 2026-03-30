import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { ArchitectureSection } from "@/components/sections/ArchitectureSection"
import { AdminPreviewSection } from "@/components/sections/AdminPreviewSection"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ArchitectureSection />
        <AdminPreviewSection />
      </main>
      <Footer />
    </>
  )
}
