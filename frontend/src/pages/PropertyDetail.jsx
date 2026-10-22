import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import FinancialCalculators from '../components/FinancialCalculators'
import DocumentWatermarkViewer from '../components/DocumentWatermarkViewer'
import PropertyDossierModal from '../components/PropertyDossierModal'
import ScheduleVisitModal from '../components/ScheduleVisitModal'
import ExpresswayConnectivity from '../components/ExpresswayConnectivity'
import { propertiesData } from '../data/propertiesData'
import './Marketplace.css'

const emptyInquiry = { buyer_name: '', buyer_email: '', buyer_phone: '', message: '' }
const emptyReview = { rating: 5, title: '', comment: '', type: 'buyer', country: '' }

export default function PropertyDetail({ onNavigate }) {
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const [property, setProperty] = useState(null)
  const [showCalc, setShowCalc] = useState(false)
  const [showDossier, setShowDossier] = useState(false)
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [inquiry, setInquiry] = useState(emptyInquiry)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [reviews, setReviews] = useState([])
  const [review, setReview] = useState(emptyReview)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const id = window.location.pathname.split('/').filter(Boolean)[1]

  useEffect(() => {
    async function loadProperty() {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(`/api/properties/${id}`)
        setProperty(res.data.data)
        const reviewsRes = await axios.get('/api/reviews')
        setReviews((reviewsRes.data.data || []).filter(item => Number(item.seller_property_draft_id) === Number(id)))
      } catch {
        const local = propertiesData.find(item => String(item.id) === String(id))
        if (local) {
          setProperty(local)
        } else {
          setError('This property could not be found or is not published yet.')
        }
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [id])

  useEffect(() => {
    if (!user?.id) {
      setSaved(false)
      return
    }

    async function loadSavedStatus() {
      try {
        const res = await axios.get(`/api/properties/${id}/saved?user_id=${user.id}`)
        setSaved(Boolean(res.data.saved))
      } catch {
        setSaved(false)
      }
    }

    loadSavedStatus()
  }, [id, user])

  async function sendInquiry(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await axios.post(`/api/properties/${id}/inquiries`, {
        buyer_name: inquiry.buyer_name || user?.name || '',
        buyer_email: inquiry.buyer_email || user?.email || '',
        buyer_phone: inquiry.buyer_phone || user?.phone || '',
        message: inquiry.message,
        buyer_id: user?.id || null,
      })
      setMessage(res.data.message || 'Inquiry sent.')
      setInquiry({
        ...emptyInquiry,
        buyer_name: user?.name || '',
        buyer_email: user?.email || '',
        buyer_phone: user?.phone || '',
      })
    } catch (err) {
      setError(getApiError(err, 'Could not send this inquiry. Please check the form.'))
    }
  }

  async function toggleSaved() {
    setMessage('')
    setError('')

    if (!user?.id) {
      setError('Please sign in as a buyer to save properties.')
      return
    }

    try {
      if (saved) {
        const res = await axios.delete(`/api/properties/${id}/saved`, { data: { user_id: user.id } })
        setMessage(res.data.message || 'Property removed.')
        setSaved(false)
      } else {
        const res = await axios.post(`/api/properties/${id}/saved`, { user_id: user.id })
        setMessage(res.data.message || 'Property saved.')
        setSaved(true)
      }
    } catch (err) {
      setError(getApiError(err, 'Could not update saved property.'))
    }
  }

  async function submitReview(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const res = await axios.post('/api/reviews', {
        ...review,
        seller_property_draft_id: property.id,
        user_id: user?.id || null,
        name: user?.name || inquiry.buyer_name || 'Guest reviewer',
        email: user?.email || inquiry.buyer_email || '',
        role_label: property.title,
      })
      setMessage(res.data.message || 'Review submitted.')
      setReview(emptyReview)
    } catch (err) {
      setError(getApiError(err, 'Could not submit your review.'))
    }
  }

  if (loading) {
    return <main className="container marketplace-loading">Loading property...</main>
  }

  if (!property) {
    return (
      <main className="container marketplace-loading">
        <h1>Property not found</h1>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => onNavigate('properties')}>Back to properties</button>
      </main>
    )
  }

  const imageUrls = property.image_urls || []
  const hasCoordinates = property.latitude && property.longitude
  const mapSrc = hasCoordinates
    ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
    : ''
  const isDeedVerified = Boolean(property.is_deed_verified)

  const whatsappMsg = `Hello, I am interested in property #${property.id} (${property.title || property.type} in ${property.district}) listed on KNW PRO Realtor. Can we schedule a viewing?`
  const rawPhone = property.whatsapp_phone || property.contact_number || property.seller?.phone || '94771234567'
  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '') || '94771234567'
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`

  return (
    <div className="page property-detail-page">
      <section className="property-detail-hero">
        <div className="container property-detail-hero__inner">
          <div>
            <div className="breadcrumb">
              <button onClick={() => onNavigate('home')}>Home</button>
              <span>/</span>
              <button onClick={() => onNavigate('properties')}>Properties</button>
              <span>/</span>
              <span>{property.type}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span className="marketplace-kicker">{property.badge_label}</span>
              {isDeedVerified && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    background: '#059669',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  🛡️ KNW Deed Verified
                </span>
              )}
            </div>
            <h1>{property.title}</h1>
            <p>{property.district}</p>
          </div>
          <div className="property-price-panel">
            <span>Expected price</span>
            <strong>{formatPrice(property.price)}</strong>
            <em>{property.inquiries_count || 0} buyer inquiries</em>
            <button className={saved ? 'property-save-btn property-save-btn--active' : 'property-save-btn'} onClick={toggleSaved}>
              {saved ? 'Saved property' : 'Save property'}
            </button>
            {user && (
              <button
                className="btn-white"
                style={{ marginTop: '8px', width: '100%', fontSize: '13px', padding: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                onClick={() => setShowCalc(true)}
              >
                🧮 Stamp Duty & EMI Calculator
              </button>
            )}
            {user ? (
              <button
                className="btn-white"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '13px',
                  padding: '9px 12px',
                  border: '1px solid #10b981',
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => setShowDossier(true)}
                title="Download official due diligence & valuation dossier"
              >
                📄 Official Property Dossier (PDF)
              </button>
            ) : (
              <button
                className="btn-white"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '12px',
                  padding: '9px 12px',
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}
                title="Sign in to download certified due diligence report"
              >
                🔒 Sign In for Property Dossier (PDF)
              </button>
            )}
            {user ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '13px',
                  padding: '10px 12px',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  fontWeight: '700',
                }}
              >
                💬 One-Click WhatsApp Lead
              </a>
            ) : (
              <button
                className="btn-primary"
                onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '12px',
                  padding: '10px 12px',
                  background: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Sign in to chat directly with seller"
              >
                🔒 Sign in for WhatsApp Lead
              </button>
            )}

            {user ? (
              <button
                type="button"
                className="btn-primary"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '13px',
                  padding: '10px 12px',
                  background: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                }}
                onClick={() => setShowVisitModal(true)}
              >
                📅 Book Physical Site Inspection
              </button>
            ) : (
              <button
                type="button"
                className="btn-white"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  fontSize: '12px',
                  padding: '9px 12px',
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}
              >
                🔒 Sign in to Book Site Visit
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="container property-detail-body">
        <section className="property-detail-main">
          <div className="property-photo-stage">
            {imageUrls[0] ? <img src={imageUrls[0]} alt={property.title} /> : <span>{property.type}</span>}
          </div>
          {imageUrls.length > 1 && (
            <div className="property-gallery-grid">
              {imageUrls.slice(1).map((url, index) => (
                <img src={url} alt={`${property.title} ${index + 2}`} key={url} />
              ))}
            </div>
          )}

          <div className="property-info-grid">
            <article>
              <span>Type</span>
              <strong>{property.type}</strong>
            </article>
            <article>
              <span>District</span>
              <strong>{property.district}</strong>
            </article>
            <article>
              <span>Plan</span>
              <strong>{property.listing_plan}</strong>
            </article>
            <article>
              <span>Published</span>
              <strong>{property.published_at ? new Date(property.published_at).toLocaleDateString() : 'Recently'}</strong>
            </article>
          </div>

          {/* Deed Verification Banner */}
          {isDeedVerified && (
            <div className="certified-title-box">
              <div className="certified-title-header">
                <span className="certified-shield-icon">🛡️</span>
                <div>
                  <h3>KNW Certified Inspection • Deed & Title Verified</h3>
                  <p>Inspected under Sri Lankan Land Registration & Notaries Ordinance standards.</p>
                </div>
                <span className="certified-status-pill">100% CLEAR TITLE</span>
              </div>
              {user ? (
                <div className="certified-title-checklist">
                  <div className="certified-item">
                    <span className="check-mark">✓</span>
                    <div>
                      <strong>30-Year Prior Title Chain</strong>
                      <p>Deed trail and folio extractions verified free from encumbrances, caveats, or lis pendens.</p>
                    </div>
                  </div>
                  <div className="certified-item">
                    <span className="check-mark">✓</span>
                    <div>
                      <strong>Survey Plan & Boundary Concordance</strong>
                      <p>Certified survey plan boundaries match physical boundaries and access road reservation.</p>
                    </div>
                  </div>
                  <div className="certified-item">
                    <span className="check-mark">✓</span>
                    <div>
                      <strong>Council & Municipal Clearances</strong>
                      <p>Local authority street line, non-vesting certificate, and rates clearance confirmed.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="certified-locked-prompt">
                  <p>🔒 Detailed 30-year deed chain and municipal inspection report is available exclusively for registered members.</p>
                  <button className="btn-primary" onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}>
                    Sign In to Unlock Deed Report
                  </button>
                </div>
              )}
            </div>
          )}

          <section className="property-detail-section">
            <h2>Description</h2>
            <p>{property.description || 'No detailed description was added yet. Contact the seller for more information about this property.'}</p>
          </section>

          {/* Watermarked Document & Survey Plan Viewer */}
          <DocumentWatermarkViewer
            property={property}
            user={user}
            onNavigate={onNavigate}
          />

          <section className="property-detail-section">
            <h2>Visit availability</h2>
            <div className="property-tag-row">
              {(property.visit_dates || []).map(date => <span key={date}>{date}</span>)}
              {(property.visit_days || []).map(day => <span key={day}>{day}</span>)}
              {!(property.visit_dates || []).length && !(property.visit_days || []).length && <span>Call seller to arrange a visit</span>}
              {property.visit_time && <span>{property.visit_time}</span>}
            </div>
          </section>

          {/* Expressway & Proximity Connectivity Index */}
          <ExpresswayConnectivity property={property} />

          <section className="property-map-panel">
            <h2>Location overview</h2>
            <p>{property.district}</p>
            {hasCoordinates && <iframe title="Property location map" src={mapSrc} loading="lazy" />}
            {property.location_url && <a href={property.location_url} target="_blank" rel="noreferrer">Open location link</a>}
          </section>

          <section className="property-detail-section">
            <h2>Buyer reviews for this property</h2>
            <div className="property-review-list">
              {reviews.length === 0 && <p>No approved reviews for this property yet.</p>}
              {reviews.map(item => (
                <article key={item.id}>
                  <strong>{item.rating}/5 - {item.title || item.name}</strong>
                  <span>{item.name} {item.country ? `- ${item.country}` : ''}</span>
                  <p>{item.comment}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="property-contact-panel" id="contact">
          <div className="property-seller-card">
            <span>Seller</span>
            <strong>{property.seller?.name || 'KNW PRO REALTOR seller'}</strong>
            {property.contact_number && <p>{property.contact_number}</p>}
          </div>

          {(message || error) && (
            <div className={`marketplace-alert ${error ? 'marketplace-alert--error' : ''}`}>
              {error || message}
            </div>
          )}

          <form className="property-inquiry-form" onSubmit={sendInquiry}>
            <h2>Send inquiry</h2>
            <label>Name<input value={inquiry.buyer_name || user?.name || ''} onChange={e => setInquiry({ ...inquiry, buyer_name: e.target.value })} required /></label>
            <label>Email<input type="email" value={inquiry.buyer_email || user?.email || ''} onChange={e => setInquiry({ ...inquiry, buyer_email: e.target.value })} required /></label>
            <label>Phone<input value={inquiry.buyer_phone || user?.phone || ''} onChange={e => setInquiry({ ...inquiry, buyer_phone: e.target.value })} /></label>
            <label>Message<textarea rows="4" value={inquiry.message} onChange={e => setInquiry({ ...inquiry, message: e.target.value })} placeholder="I am interested in this property. Please contact me." /></label>
            <button className="btn-primary" type="submit">Send inquiry</button>
          </form>

          <form className="property-inquiry-form property-review-form" onSubmit={submitReview}>
            <h2>Write a review</h2>
            <label>Rating
              <select value={review.rating} onChange={e => setReview({ ...review, rating: Number(e.target.value) })}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Bad</option>
              </select>
            </label>
            <label>Review type
              <select value={review.type} onChange={e => setReview({ ...review, type: e.target.value })}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="foreign_buyer">Foreign buyer</option>
                <option value="lawyer_client">Lawyer client</option>
              </select>
            </label>
            <label>Country<input value={review.country} onChange={e => setReview({ ...review, country: e.target.value })} placeholder="Sri Lanka" /></label>
            <label>Title<input value={review.title} onChange={e => setReview({ ...review, title: e.target.value })} placeholder="Great property experience" /></label>
            <label>Review<textarea rows="4" value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} required /></label>
            <button className="btn-primary" type="submit">Submit review</button>
          </form>
        </aside>
      </main>

      {showCalc && (
        <FinancialCalculators
          initialPrice={parseFloat(String(property.price).replace(/[^0-9.]/g, '')) || 25000000}
          onClose={() => setShowCalc(false)}
        />
      )}

      {showDossier && (
        <PropertyDossierModal
          property={property}
          onClose={() => setShowDossier(false)}
        />
      )}

      {showVisitModal && (
        <ScheduleVisitModal
          property={property}
          user={user}
          onClose={() => setShowVisitModal(false)}
        />
      )}
    </div>
  )
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}
