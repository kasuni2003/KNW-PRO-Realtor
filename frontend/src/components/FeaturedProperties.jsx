import axios from 'axios'
import { useEffect, useState } from 'react'
import PropertyCard from './PropertyCard'
import { propertiesData } from '../data/propertiesData'
import './FeaturedProperties.css'

export const properties = propertiesData

export default function FeaturedProperties({ onNavigate }) {
  const [items, setItems] = useState(propertiesData)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await axios.get('/api/properties?sort=plan')
        const liveProperties = res.data.data || []
        if (liveProperties.length > 0) {
          setItems(liveProperties)
        }
      } catch {
        setItems(propertiesData)
      }
    }
    loadFeatured()
  }, [])

  const filteredItems = items.filter(p => {
    if (activeTab === 'lands') return p.type === 'Land'
    if (activeTab === 'houses') return p.type === 'House'
    if (activeTab === 'apartments') return p.type === 'Apartment'
    if (activeTab === 'villas') return p.type === 'Villa'
    return true
  }).slice(0, 6)

  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured properties & prime lands</h2>
            <p className="section-subtitle">Handpicked verified listings across Sri Lanka with certified deed review</p>
          </div>
          <button
            onClick={() => onNavigate ? onNavigate('properties') : (window.location.href = '/properties')}
            className="view-all"
            style={{ background: 'transparent', cursor: 'pointer' }}
          >
            View all listings ({items.length})
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { id: 'all', label: '⭐ All Featured' },
            { id: 'lands', label: '🌱 Featured Lands (Perch Metrics)' },
            { id: 'houses', label: '🏡 Luxury Houses' },
            { id: 'apartments', label: '🏢 Modern Apartments' },
            { id: 'villas', label: '🏖️ Coastal Villas' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                border: activeTab === tab.id ? '1px solid #059669' : '1px solid #cbd5e1',
                background: activeTab === tab.id ? '#059669' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="featured-grid">
          {filteredItems.map(p => (
            <PropertyCard key={p.id} property={p} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  )
}
