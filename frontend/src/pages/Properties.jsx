import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PropertyCard from '../components/PropertyCard'
import { properties as demoProperties } from '../components/FeaturedProperties'
import InteractiveMapModal from '../components/InteractiveMapModal'
import PropertyCompareModal from '../components/PropertyCompareModal'
import FinancialCalculators from '../components/FinancialCalculators'
import PriceEstimator from '../components/PriceEstimator'
import './Marketplace.css'

function extractOptions(list) {
  const types = [...new Set(list.map(p => p.type || p.property_type).filter(Boolean))].sort()
  const districts = [...new Set(list.map(p => p.district).filter(Boolean))].sort()
  return { types, districts }
}

function filterLocalProperties(list, filterObj) {
  return list.filter(item => {
    const itemType = (item.type || item.property_type || '').toLowerCase()
    const itemDistrict = (item.district || '').toLowerCase()
    const itemTown = (item.town || '').toLowerCase()
    const itemTitle = (item.title || '').toLowerCase()
    const itemDesc = (item.description || '').toLowerCase()
    const itemPrice = (item.price || item.expected_price || '').toLowerCase()

    if (filterObj.type && itemType !== filterObj.type.toLowerCase()) {
      return false
    }
    if (filterObj.district && !itemDistrict.includes(filterObj.district.toLowerCase())) {
      return false
    }
    if (filterObj.search) {
      const q = filterObj.search.toLowerCase()
      const match =
        itemTitle.includes(q) ||
        itemDesc.includes(q) ||
        itemDistrict.includes(q) ||
        itemTown.includes(q) ||
        itemType.includes(q) ||
        itemPrice.includes(q)
      if (!match) return false
    }
    if (filterObj.nearExpressway && !item.expressway_proximity) {
      return false
    }
    if (filterObj.deedVerifiedOnly && !item.is_deed_verified) {
      return false
    }
    return true
  })
}

const emptyFilters = {
  search: '',
  type: '',
  district: '',
  sort: 'newest',
  nearExpressway: false,
  deedVerifiedOnly: false,
}

export default function Properties({ onNavigate }) {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [filters, setFilters] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || '',
      district: searchParams.get('district') || '',
      sort: searchParams.get('sort') || 'newest',
      nearExpressway: searchParams.get('nearExpressway') === 'true',
      deedVerifiedOnly: searchParams.get('deedVerified') === 'true',
    }
  })
  const [options, setOptions] = useState(extractOptions(demoProperties))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Advanced feature modal states
  const [showMapModal, setShowMapModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showCalcModal, setShowCalcModal] = useState(false)
  const [showEstimatorModal, setShowEstimatorModal] = useState(false)
  const [compareProperties, setCompareProperties] = useState([])

  useEffect(() => {
    loadProperties(filters)
  }, [])

  async function loadProperties(nextFilters = filters) {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value && typeof value === 'string') params.set(key, value)
      })
      const res = await axios.get(`/api/properties${params.toString() ? `?${params}` : ''}`)
      let list = res.data.data || []
      if (list.length === 0) {
        list = filterLocalProperties(demoProperties, nextFilters)
      } else {
        if (nextFilters.nearExpressway) {
          list = list.filter(p => p.expressway_proximity)
        }
        if (nextFilters.deedVerifiedOnly) {
          list = list.filter(p => p.is_deed_verified)
        }
      }
      setProperties(list)
      setOptions(res.data.filters?.districts?.length ? res.data.filters : extractOptions(demoProperties))
    } catch {
      setProperties(filterLocalProperties(demoProperties, nextFilters))
      setOptions(extractOptions(demoProperties))
    } finally {
      setLoading(false)
    }
  }

  const totalText = useMemo(() => {
    if (loading) return 'Loading listings...'
    return `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`
  }, [loading, properties.length])

  function updateFilter(key, value) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    loadProperties(next)
  }

  function clearFilters() {
    setFilters(emptyFilters)
    loadProperties(emptyFilters)
  }

  const toggleCompare = (prop) => {
    setCompareProperties(prev => {
      const exists = prev.some(p => p.id === prop.id)
      if (exists) {
        return prev.filter(p => p.id !== prop.id)
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 properties at a time.')
        return prev
      }
      return [...prev, prop]
    })
  }

  return (
    <div className="page marketplace-page">
      <div className="page-hero marketplace-hero">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span>/</span>
            <span>Properties</span>
          </div>
          <h1 className="page-hero__title">Browse verified property listings & prime lands</h1>
          <p className="page-hero__sub">
            Search approved lands with price-per-perch metrics, residential homes, apartments, and commercial plots reviewed by the KNW PRO REALTOR team.
          </p>
        </div>
      </div>

      <main className="container marketplace-body">
        {/* Hotspot & Smart Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => updateFilter('type', filters.type === 'Land' ? '' : 'Land')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: filters.type === 'Land' ? '1px solid #059669' : '1px solid #cbd5e1',
              background: filters.type === 'Land' ? '#059669' : '#ffffff',
              color: filters.type === 'Land' ? '#ffffff' : '#065f46',
              cursor: 'pointer',
            }}
          >
            🌱 Prime Lands Only (Perch Metrics)
          </button>

          <button
            type="button"
            onClick={() => updateFilter('nearExpressway', !filters.nearExpressway)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: filters.nearExpressway ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: filters.nearExpressway ? '#2563eb' : '#ffffff',
              color: filters.nearExpressway ? '#ffffff' : '#1e40af',
              cursor: 'pointer',
            }}
          >
            🚗 Near Expressways (&lt; 15 mins)
          </button>

          <button
            type="button"
            onClick={() => updateFilter('deedVerifiedOnly', !filters.deedVerifiedOnly)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: filters.deedVerifiedOnly ? '1px solid #059669' : '1px solid #cbd5e1',
              background: filters.deedVerifiedOnly ? '#059669' : '#ffffff',
              color: filters.deedVerifiedOnly ? '#ffffff' : '#065f46',
              cursor: 'pointer',
            }}
          >
            🛡️ Deed Verified Only
          </button>

          {['Colombo', 'Galle', 'Matara', 'Kandy', 'Gampaha', 'Hambantota'].map(dist => (
            <button
              key={dist}
              type="button"
              onClick={() => updateFilter('district', filters.district === dist ? '' : dist)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                border: filters.district === dist ? '1px solid #0f172a' : '1px solid #e2e8f0',
                background: filters.district === dist ? '#0f172a' : '#f8fafc',
                color: filters.district === dist ? '#ffffff' : '#475569',
                cursor: 'pointer',
              }}
            >
              📍 {dist}
            </button>
          ))}
        </div>

        <section className="marketplace-filters">
          <label>
            Search
            <input
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="District, type, town, price, keyword"
            />
          </label>
          <label>
            Type
            <select value={filters.type} onChange={e => updateFilter('type', e.target.value)}>
              <option value="">All types</option>
              {options.types.map(type => <option value={type} key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            District
            <select value={filters.district} onChange={e => updateFilter('district', e.target.value)}>
              <option value="">All districts</option>
              {options.districts.map(district => <option value={district} key={district}>{district}</option>)}
            </select>
          </label>
          <label>
            Sort
            <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="plan">Featured first</option>
            </select>
          </label>
          <button type="button" onClick={clearFilters}>Clear</button>
        </section>

        {/* Toolbar & Advanced Action Tools */}
        <div className="marketplace-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', margin: '1.5rem 0' }}>
          <div>
            <strong>{totalText}</strong>
            {error && <span style={{ marginLeft: '12px', color: '#D97706', fontSize: '13px' }}>{error}</span>}
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', background: '#0f6e56' }}
                onClick={() => setShowMapModal(true)}
              >
                🗺️ Interactive Map View
              </button>
              <button
                className="btn-white"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                onClick={() => setShowCalcModal(true)}
              >
                🧮 Stamp & EMI Calculators
              </button>
              <button
                className="btn-white"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                onClick={() => setShowEstimatorModal(true)}
              >
                📊 Valuation Estimator
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn-white"
                style={{ fontSize: '12px', padding: '6px 14px', border: '1px solid #cbd5e1', cursor: 'pointer', borderRadius: '20px' }}
                onClick={() => onNavigate('login')}
              >
                🔒 Sign in to unlock Map View & Calculators
              </button>
            </div>
          )}
        </div>

        {!loading && properties.length === 0 && (
          <div className="marketplace-empty">
            <h2>No matching listings found</h2>
            <p>Try resetting the filters or clearing the search terms to view all properties.</p>
            <button className="btn-primary" onClick={clearFilters}>Reset Filters</button>
          </div>
        )}

        <div className="featured-grid marketplace-grid">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onNavigate={onNavigate}
              onToggleCompare={toggleCompare}
              isCompared={compareProperties.some(p => p.id === property.id)}
            />
          ))}
        </div>
      </main>

      {/* Floating Compare Bar */}
      {compareProperties.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1000,
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            Comparing {compareProperties.length} / 4 properties
          </span>
          <button
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '20px', background: '#10b981' }}
            onClick={() => setShowCompareModal(true)}
          >
            Open Comparison Matrix 📊
          </button>
          <button
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
            onClick={() => setCompareProperties([])}
          >
            ✕
          </button>
        </div>
      )}

      {/* Advanced Features Modals */}
      {showMapModal && (
        <InteractiveMapModal
          properties={properties}
          onClose={() => setShowMapModal(false)}
          onNavigate={onNavigate}
        />
      )}

      {showCompareModal && (
        <PropertyCompareModal
          properties={compareProperties}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setCompareProperties(prev => prev.filter(p => p.id !== id))}
        />
      )}

      {showCalcModal && (
        <FinancialCalculators onClose={() => setShowCalcModal(false)} />
      )}

      {showEstimatorModal && (
        <PriceEstimator onClose={() => setShowEstimatorModal(false)} />
      )}
    </div>
  )
}
