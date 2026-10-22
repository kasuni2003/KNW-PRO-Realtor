import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import './PropertyCard.css'

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
  </svg>
)

const RulerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1z"/>
    <line x1="7" y1="6" x2="7" y2="10"/><line x1="12" y1="6" x2="12" y2="12"/>
    <line x1="17" y1="6" x2="17" y2="10"/>
  </svg>
)

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

export default function PropertyCard({ property: p, onNavigate, onToggleCompare, isCompared }) {
  const { user } = useAuth()
  const { formatPrice, currency } = useCurrency()

  const title = p.title || `${p.type || p.property_type || 'Property'} in ${p.district}`
  const type = p.type || p.property_type || 'Property'
  const rawPrice = p.expected_price || p.price || (p.priceLKR ? `Rs. ${p.priceLKR}` : null)
  const displayPrice = formatPrice(rawPrice)
  const badge = p.badge || p.listing_plan || 'sale'
  const badgeLabel = p.badgeLabel || p.badge_label || 'For Sale'
  const color = p.color || (type === 'Land' ? '#E1F5EE' : type === 'Apartment' ? '#E6F1FB' : '#FAEEDA')
  const marker = p.emoji || (type === 'Land' ? 'Land' : type === 'Apartment' ? 'Apt' : 'Home')
  const imageUrl = p.image_url || p.image_urls?.[0]
  const isDeedVerified = Boolean(p.is_deed_verified)

  const whatsappMsg = `Hello, I am interested in property #${p.id || '104'} (${title} in ${p.district}) listed on KNW PRO Realtor. Can we schedule a viewing?`
  const rawPhone = p.whatsapp_phone || p.contact_number || p.seller?.phone || '94771234567'
  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '') || '94771234567'

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    if (!user) {
      if (onNavigate) onNavigate('login')
      else window.location.href = '/login'
      return
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`
    window.open(url, '_blank')
  }

  const handleCardClick = (e) => {
    // Avoid triggering when clicking buttons or links
    if (e.target.closest('button') || e.target.closest('input')) return
    if (onNavigate) {
      onNavigate('propertyDetail', { id: p.id })
    }
  }

  return (
    <article className="prop-card" onClick={handleCardClick} style={{ cursor: onNavigate ? 'pointer' : 'default' }}>
      <div className="prop-card__thumb" style={{ background: color }}>
        {imageUrl ? (
          <img className="prop-card__image" src={imageUrl} alt={title} />
        ) : (
          <span className="prop-card__emoji" aria-label={type}>{marker}</span>
        )}
        <span className={`badge badge-${badge} prop-card__badge`}>{badgeLabel}</span>
        {isDeedVerified && (
          <span
            className={`prop-card__deed-badge ${!user ? 'prop-card__deed-badge--locked' : ''}`}
            title={user ? 'Title deeds & survey plan reviewed by registered lawyer' : 'Sign in to view certified legal inspection report'}
            onClick={(e) => {
              if (!user && onNavigate) {
                e.stopPropagation()
                onNavigate('login')
              }
            }}
          >
            {user ? '🛡️ Deed Verified' : '🔒 Title Inspected'}
          </span>
        )}
        {p.foreignFriendly && (
          <span className="prop-card__flag" title="Foreign buyer friendly">{p.flag}</span>
        )}
        <div className="prop-card__top-actions">
          {onToggleCompare && (
            <label className="prop-card__compare-label" onClick={e => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={Boolean(isCompared)}
                onChange={() => onToggleCompare(p)}
              />
              <span>Compare</span>
            </label>
          )}
          <button className="prop-card__save" aria-label="Save property" onClick={e => e.stopPropagation()}>
            <HeartIcon />
          </button>
        </div>
      </div>

      <div className="prop-card__body">
        <span className="prop-card__type">{type}</span>
        <h3 className="prop-card__title">{title}</h3>
        <p className="prop-card__location">
          <PinIcon /> {p.district}
        </p>

        <div className="prop-card__price">
          <span className="prop-card__price-lkr">{displayPrice}</span>
          {currency !== 'LKR' && rawPrice && (
            <span className="prop-card__price-usd">approx in {currency}</span>
          )}
          {p.pricePerPerch && (
            <div className="prop-card__perch-badge">
              🌱 {p.pricePerPerch}
            </div>
          )}
        </div>

        {p.expressway_proximity && (
          <div className="prop-card__expressway-pill" title={p.expressway_name || p.expressway_proximity}>
            🚗 {p.expressway_proximity}
          </div>
        )}

        <div className="prop-card__meta">
          <span className="prop-card__meta-item">
            <RulerIcon /> {p.size || p.listing_plan || 'Verified listing'}
          </span>
          <span className="prop-card__meta-item">
            {p.roadAccess ? `🛣️ ${p.roadAccess}` : `✓ ${p.extra || `${p.inquiries_count || 0} inquiries`}`}
          </span>
        </div>
      </div>

      <div className="prop-card__footer">
        <div className="prop-card__footer-actions">
          <button
            className="prop-card__cta"
            onClick={e => {
              e.stopPropagation()
              if (onNavigate) onNavigate('propertyDetail', { id: p.id })
              else window.location.href = `/property/${p.id}`
            }}
          >
            View details
          </button>
          <button
            className="prop-card__contact"
            onClick={e => {
              e.stopPropagation()
              if (onNavigate) onNavigate('propertyDetail', { id: p.id })
              else window.location.href = `/property/${p.id}#contact`
            }}
          >
            Contact agent
          </button>
        </div>
        <button
          className={`prop-card__whatsapp ${!user ? 'prop-card__whatsapp--locked' : ''}`}
          onClick={handleWhatsApp}
          title={user ? 'Open WhatsApp chat with pre-filled lead message' : 'Sign in to contact seller directly on WhatsApp'}
        >
          <span>💬</span>
          <span>{user ? 'One-Click WhatsApp Lead' : '🔒 Sign in for WhatsApp Lead'}</span>
        </button>
      </div>
    </article>
  )
}
