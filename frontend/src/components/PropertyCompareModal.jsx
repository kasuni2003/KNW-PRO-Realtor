import { useCurrency } from '../context/CurrencyContext'
import './PropertyCompareModal.css'

export default function PropertyCompareModal({ properties = [], onRemove, onClose, onNavigate }) {
  const { formatPrice } = useCurrency()

  if (!properties || properties.length === 0) return null

  return (
    <div className="compare-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="compare-modal">
        {/* Header */}
        <div className="compare-header">
          <div className="compare-header-title">
            <span className="compare-badge-icon">⚖️</span>
            <div>
              <h3>Side-by-Side Property Comparison</h3>
              <p>Comparing {properties.length} {properties.length === 1 ? 'property' : 'properties'} across key metrics</p>
            </div>
          </div>
          <button className="compare-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {/* Comparison Table */}
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-feature-col">Property Details</th>
                {properties.map(p => (
                  <th key={p.id} className="compare-property-col">
                    <div className="compare-card-head">
                      <button
                        className="compare-remove-btn"
                        onClick={() => onRemove(p.id)}
                        title="Remove from comparison"
                      >
                        &times;
                      </button>
                      <div className="compare-img-wrap">
                        {p.image_url || (p.images && p.images[0]) ? (
                          <img src={p.image_url || p.images[0]} alt={p.title} />
                        ) : (
                          <div className="compare-img-placeholder">🏡</div>
                        )}
                        <span className="compare-plan-tag">{p.listing_plan || p.badge || 'Verified'}</span>
                      </div>
                      <h4>{p.title || `${p.property_type || p.type} in ${p.district}`}</h4>
                      <div className="compare-price-tag">
                        {formatPrice(p.expected_price || p.price)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="compare-label">Property Type</td>
                {properties.map(p => (
                  <td key={p.id}>
                    <strong>{p.property_type || p.type || 'Residential'}</strong>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="compare-label">District / Location</td>
                {properties.map(p => (
                  <td key={p.id}>{p.district || 'Sri Lanka'}</td>
                ))}
              </tr>

              <tr>
                <td className="compare-label">Listing Tier</td>
                {properties.map(p => (
                  <td key={p.id}>
                    <span className={`compare-tier-pill tier-${p.listing_plan || 'verified'}`}>
                      {p.listing_plan ? p.listing_plan.toUpperCase() : 'VERIFIED'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="compare-label">Visit Availability</td>
                {properties.map(p => (
                  <td key={p.id}>
                    {p.visit_days && p.visit_days.length > 0
                      ? p.visit_days.join(', ')
                      : p.visit_time || 'By appointment'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="compare-label">Description Summary</td>
                {properties.map(p => (
                  <td key={p.id} className="compare-desc-cell">
                    <p>{p.description ? p.description.slice(0, 140) + '...' : 'Verified listing by KNW PRO REALTOR.'}</p>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="compare-label">Buyer Inquiries</td>
                {properties.map(p => (
                  <td key={p.id}>
                    <span>{p.inquiries_count || 0} interested buyers</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="compare-label">Actions</td>
                {properties.map(p => (
                  <td key={p.id}>
                    <button
                      className="btn-primary compare-view-btn"
                      onClick={() => {
                        onClose?.()
                        onNavigate('propertyDetail', { id: p.id })
                      }}
                    >
                      View Full Listing →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
