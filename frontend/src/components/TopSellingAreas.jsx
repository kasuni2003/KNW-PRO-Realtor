import React from 'react'
import './TopSellingAreas.css'

export const hotspotsData = [
  {
    id: 'colombo-07',
    name: 'Colombo 07 (Cinnamon Gardens)',
    district: 'Colombo',
    growth: '+14.5% YoY',
    avgPerch: 'Rs. 18.5M – 25M',
    tag: '👑 Ultra-Luxury & Embassy Belt',
    connectivity: '🚗 12m to Airport Highway',
    description: 'The highest land valuation district in Sri Lanka. Home to prime diplomatic missions, elite private schools, and ultra-high-net-worth family residences.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'galle-fort',
    name: 'Galle Fort & Coastal Belt',
    district: 'Galle',
    growth: '+19.2% YoY',
    avgPerch: 'Rs. 12M – 20M / Perch',
    tag: '🏛️ UNESCO World Heritage',
    connectivity: '🚗 10m to E01 Southern Exp',
    description: 'A global tourism magnet with unmatched capital appreciation. Dutch colonial ramparts, luxury boutique villas, and high-occupancy international rentals.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mirissa-weligama',
    name: 'Mirissa & Weligama Bay',
    district: 'Matara',
    growth: '+22.4% YoY',
    avgPerch: 'Rs. 3.5M – 6.5M / Perch',
    tag: '🏄 Beachfront & Surfing Capital',
    connectivity: '🚗 12m to Kokmaduwa E01',
    description: 'Sri Lanka’s fastest-growing coastal leisure hotspot. Whale-watching harbor, world-class beach breaks, and 12-16% foreign currency villa yields.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kandy-hills',
    name: 'Kandy & Peradeniya Valley',
    district: 'Kandy',
    growth: '+11.8% YoY',
    avgPerch: 'Rs. 2.5M – 5.5M / Perch',
    tag: '⛰️ Hill Capital & Golf Resorts',
    connectivity: '🚗 20m to Central Exp (E04)',
    description: 'Cultural prestige, cool hill climate, and sweeping lake views. Direct connection via the Central Expressway turns Kandy into a prime second-home hub.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gampaha-negombo',
    name: 'Gampaha & Negombo Airport Corridor',
    district: 'Gampaha',
    growth: '+16.0% YoY',
    avgPerch: 'Rs. 1.4M – 2.8M / Perch',
    tag: '✈️ Expressway Junction Hub',
    connectivity: '🚗 5m to E04 / E03 Interchanges',
    description: 'Strategic junction linking the Central Expressway and Katunayake Airport Highway. Fast 20-minute commute to Colombo CBD with high residential land demand.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tangalle-bay',
    name: 'Tangalle (Mawella Bay)',
    district: 'Hambantota',
    growth: '+18.0% YoY',
    avgPerch: 'Rs. 2.2M – 4.5M / Perch',
    tag: '🌴 Exclusive Coastal Enclave',
    connectivity: '🚗 15m to Beliatta E01',
    description: 'Pristine turquoise waters, dramatic headlands, and 5-star resort hideaways (Amanwella). Preferred by international buyers for private luxury estates.',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
  },
]

export default function TopSellingAreas({ onNavigate }) {
  const handleSelectArea = (district) => {
    if (onNavigate) {
      onNavigate('properties', { district })
    } else {
      window.location.href = `/properties?district=${encodeURIComponent(district)}`
    }
  }

  return (
    <section className="hotspots-section" id="investment-hotspots">
      <div className="container">
        <div className="hotspots-header">
          <div className="hotspots-title-group">
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Market Intelligence & Trends
            </span>
            <h2>Sri Lanka Investment Hotspots & Top Selling Areas</h2>
            <p>Live land valuation benchmarks, annual capital appreciation rates, and expressway connectivity metrics</p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate ? onNavigate('properties') : (window.location.href = '/properties')}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            Explore All 25 Districts →
          </button>
        </div>

        <div className="hotspots-grid">
          {hotspotsData.map(h => (
            <article
              key={h.id}
              className="hotspot-card"
              onClick={() => handleSelectArea(h.district)}
              title={`View verified properties in ${h.district}`}
            >
              <div className="hotspot-image-wrap">
                <img src={h.image} alt={h.name} className="hotspot-img" />
                <div className="hotspot-badge-overlay">{h.tag}</div>
                <div className="hotspot-growth-tag">{h.growth}</div>
              </div>

              <div className="hotspot-body">
                <div className="hotspot-name-row">
                  <h3>{h.name}</h3>
                  <span className="hotspot-district">{h.district}</span>
                </div>

                <div className="hotspot-metrics-box">
                  <div className="hotspot-metric-item">
                    <span>Avg Land Valuation</span>
                    <strong className="perch-price">{h.avgPerch}</strong>
                  </div>
                  <div className="hotspot-metric-item" style={{ textAlign: 'right' }}>
                    <span>Appreciation</span>
                    <strong style={{ color: '#059669' }}>{h.growth}</strong>
                  </div>
                </div>

                <p className="hotspot-desc">{h.description}</p>

                <div className="hotspot-footer">
                  <span className="hotspot-connectivity-tag">{h.connectivity}</span>
                  <button type="button" className="hotspot-action-btn">
                    View Listings →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
