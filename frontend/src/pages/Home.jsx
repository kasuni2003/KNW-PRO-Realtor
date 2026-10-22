import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import TopSellingAreas from '../components/TopSellingAreas'
import FeaturedProperties from '../components/FeaturedProperties'
import LegalAdvice from '../components/LegalAdvice'
import ForeignBuyers from '../components/ForeignBuyers'
import CallToAction from '../components/CallToAction'
import Footer from '../components/Footer'

export default function Home({ onNavigate }) {
  return (
    <div className="app">
      <Navbar onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <StatsBar />
      <div id="investment-hotspots">
        <TopSellingAreas onNavigate={onNavigate} />
      </div>
      <div id="featured-properties">
        <FeaturedProperties onNavigate={onNavigate} />
      </div>
      <div id="legal-advice">
        <LegalAdvice onNavigate={onNavigate} />
      </div>
      <div id="foreign-buyers">
        <ForeignBuyers onNavigate={onNavigate} />
      </div>
      <div id="contact">
        <CallToAction onNavigate={onNavigate} />
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  )
}
