import { useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import './InteractiveMapModal.css'

// District map coordinates mapped on SVG viewBox 0 0 800 1000
const DISTRICT_COORDS = {
  Jaffna: { x: 380, y: 80, name: 'Jaffna' },
  Kilinochchi: { x: 390, y: 150, name: 'Kilinochchi' },
  Mannar: { x: 300, y: 220, name: 'Mannar' },
  Vavuniya: { x: 420, y: 240, name: 'Vavuniya' },
  Mullaitivu: { x: 460, y: 190, name: 'Mullaitivu' },
  Anuradhapura: { x: 390, y: 340, name: 'Anuradhapura' },
  Trincomalee: { x: 550, y: 320, name: 'Trincomalee' },
  Puttalam: { x: 260, y: 440, name: 'Puttalam' },
  Kurunegala: { x: 350, y: 520, name: 'Kurunegala' },
  Matale: { x: 440, y: 490, name: 'Matale' },
  Polonnaruwa: { x: 520, y: 420, name: 'Polonnaruwa' },
  Batticaloa: { x: 620, y: 480, name: 'Batticaloa' },
  Ampara: { x: 620, y: 600, name: 'Ampara' },
  Kandy: { x: 420, y: 580, name: 'Kandy' },
  'Nuwara Eliya': { x: 440, y: 660, name: 'Nuwara Eliya' },
  Badulla: { x: 520, y: 640, name: 'Badulla' },
  Monaragala: { x: 550, y: 720, name: 'Monaragala' },
  Gampaha: { x: 300, y: 640, name: 'Gampaha' },
  Colombo: { x: 280, y: 690, name: 'Colombo' },
  Kegalle: { x: 360, y: 620, name: 'Kegalle' },
  Kalutara: { x: 290, y: 760, name: 'Kalutara' },
  Ratnapura: { x: 390, y: 730, name: 'Ratnapura' },
  Galle: { x: 310, y: 860, name: 'Galle' },
  Matara: { x: 380, y: 890, name: 'Matara' },
  Hambantota: { x: 480, y: 850, name: 'Hambantota' },
}

export default function InteractiveMapModal({ properties = [], onClose, onNavigate }) {
  const { formatPrice } = useCurrency()
  const [selectedDistrict, setSelectedDistrict] = useState('All')
  const [activeProperty, setActiveProperty] = useState(null)

  // Filter listings
  const filteredListings = properties.filter(p =>
    selectedDistrict === 'All' ? true : p.district === selectedDistrict
  )

  // Map each property to approximate district coordinate
  const pins = filteredListings.map((p, index) => {
    const base = DISTRICT_COORDS[p.district] || DISTRICT_COORDS.Colombo
    // Offset slightly if multiple in same district
    const offsetX = (index % 3 - 1) * 22
    const offsetY = Math.floor(index / 3) * 22
    return {
      ...p,
      x: base.x + offsetX,
      y: base.y + offsetY,
    }
  })

  return (
    <div className="map-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="map-modal">
        {/* Header */}
        <div className="map-header">
          <div className="map-title-wrap">
            <span className="map-badge-icon">🗺️</span>
            <div>
              <h3>Interactive Sri Lanka Property Map</h3>
              <p>Explore verified land, houses, and beachfront properties across all 25 districts</p>
            </div>
          </div>
          <button className="map-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {/* District Filter Bar */}
        <div className="map-district-bar">
          <button
            className={`map-dist-pill ${selectedDistrict === 'All' ? 'active' : ''}`}
            onClick={() => {
              setSelectedDistrict('All')
              setActiveProperty(null)
            }}
          >
            All Districts ({properties.length})
          </button>
          {['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Nuwara Eliya', 'Kalutara', 'Matara'].map(d => {
            const count = properties.filter(p => p.district === d).length
            return (
              <button
                key={d}
                className={`map-dist-pill ${selectedDistrict === d ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDistrict(d)
                  setActiveProperty(null)
                }}
              >
                {d} {count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>

        {/* Map Body */}
        <div className="map-body">
          {/* Map Visual */}
          <div className="map-canvas-container">
            <svg
              viewBox="180 50 520 900"
              className="map-sri-lanka-svg"
            >
              {/* Sri Lanka Stylized Island Shape Outline */}
              <path
                d="M 380 70 
                   C 420 80, 480 140, 480 190 
                   C 530 250, 590 320, 620 420 
                   C 660 520, 640 650, 580 750 
                   C 540 820, 480 890, 400 910 
                   C 340 920, 280 880, 290 820 
                   C 260 760, 260 680, 280 600 
                   C 240 500, 240 380, 290 280 
                   C 320 220, 340 140, 380 70 Z"
                className="map-island-bg"
              />

              {/* District Center Dots & Labels */}
              {Object.entries(DISTRICT_COORDS).map(([name, pt]) => (
                <g key={name} className="map-district-marker">
                  <circle cx={pt.x} cy={pt.y} r="3" className="map-district-dot" />
                  <text x={pt.x} y={pt.y - 6} className="map-district-label">
                    {name}
                  </text>
                </g>
              ))}

              {/* Listing Pins */}
              {pins.map(p => {
                const isSelected = activeProperty?.id === p.id
                return (
                  <g
                    key={p.id}
                    className={`map-pin-group ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setActiveProperty(p)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '14' : '10'}
                      className="map-pin-circle"
                    />
                    <text x={p.x} y={p.y + 4} className="map-pin-icon">
                      📍
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Instruction tooltip */}
            <div className="map-overlay-tip">
              💡 Click on any red pin to view property details and pricing
            </div>
          </div>

          {/* Property Sidebar / Card Preview */}
          <div className="map-sidebar">
            <h4>
              {selectedDistrict === 'All' ? 'Available Properties' : `Listings in ${selectedDistrict}`} ({filteredListings.length})
            </h4>

            {activeProperty ? (
              <div className="map-card-preview">
                <div className="map-card-img-wrap">
                  {activeProperty.image_url || (activeProperty.images && activeProperty.images[0]) ? (
                    <img src={activeProperty.image_url || activeProperty.images[0]} alt={activeProperty.title} />
                  ) : (
                    <div className="map-card-img-fallback">🏡</div>
                  )}
                  <span className="map-card-plan">{activeProperty.listing_plan || 'Verified'}</span>
                </div>
                <div className="map-card-info">
                  <span className="map-card-dist">{activeProperty.district} · {activeProperty.property_type || activeProperty.type}</span>
                  <h3>{activeProperty.title || `${activeProperty.property_type} in ${activeProperty.district}`}</h3>
                  <div className="map-card-price">
                    {formatPrice(activeProperty.expected_price || activeProperty.price)}
                  </div>
                  <p>{activeProperty.description ? activeProperty.description.slice(0, 110) + '...' : 'Inspected & verified listing by KNW PRO REALTOR.'}</p>
                  <button
                    className="btn-primary map-card-btn"
                    onClick={() => {
                      onClose?.()
                      onNavigate('propertyDetail', { id: activeProperty.id })
                    }}
                  >
                    View Full Property Details →
                  </button>
                </div>
              </div>
            ) : (
              <div className="map-sidebar-list">
                {filteredListings.length === 0 ? (
                  <p className="map-no-prop">No active listings in this district yet.</p>
                ) : (
                  filteredListings.map(p => (
                    <div
                      key={p.id}
                      className="map-list-item"
                      onClick={() => setActiveProperty(p)}
                    >
                      <div className="map-list-item-info">
                        <strong>{p.title || `${p.property_type || p.type} in ${p.district}`}</strong>
                        <span>{p.district} · {p.property_type || p.type}</span>
                        <div className="map-list-price">{formatPrice(p.expected_price || p.price)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
