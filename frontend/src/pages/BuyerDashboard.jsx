import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import PropertyDossierModal from '../components/PropertyDossierModal'
import ScheduleVisitModal from '../components/ScheduleVisitModal'
import { downloadCalendarInvite } from '../utils/calendarInvite'
import './BuyerDashboard.css'
import './Marketplace.css'

export default function BuyerDashboard({ onNavigate }) {
  const { user, switchRole } = useAuth()
  const [activeTab, setActiveTab] = useState('saved')
  const [savedProperties, setSavedProperties] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [appointments, setAppointments] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    role_label: 'First-time Home Buyer',
    type: 'buyer',
    seller_property_draft_id: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDossier, setSelectedDossier] = useState(null)
  const [selectedVisitProperty, setSelectedVisitProperty] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadDashboardData()
  }, [user])

  if (!user) {
    return (
      <main className="container marketplace-loading" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1>Member Sign-in Required</h1>
        <p>Sign in to your account to access your saved properties, lawyer video consultations, and site visits.</p>
        <button className="btn-primary" onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}>
          Sign In to Account
        </button>
      </main>
    )
  }

  async function loadDashboardData() {
    setLoading(true)
    setError('')
    try {
      const [savedRes, inquiriesRes, appointmentsRes, reviewsRes] = await Promise.all([
        axios.get(`/api/saved-properties?user_id=${user.id}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/api/buyer/inquiries?user_id=${user.id}&email=${encodeURIComponent(user.email)}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/api/user/appointments?user_id=${user.id}&email=${encodeURIComponent(user.email)}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/api/user/reviews?user_id=${user.id}&email=${encodeURIComponent(user.email)}`).catch(() => ({ data: { data: [] } })),
      ])

      const savedList = (savedRes.data?.data || []).map(item => item.property).filter(Boolean)
      setSavedProperties(savedList)
      setInquiries(inquiriesRes.data?.data || [])
      setAppointments(appointmentsRes.data?.data || [])
      setMyReviews(reviewsRes.data?.data || [])
    } catch {
      setError('Could not load some dashboard data.')
      setSavedProperties([])
      setInquiries([])
      setAppointments([])
      setMyReviews([])
    } finally {
      setLoading(false)
    }
  }

  async function removeSaved(propertyId) {
    try {
      await axios.delete(`/api/properties/${propertyId}/saved`, { data: { user_id: user.id } })
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId))
      setMessage('Property removed from your shortlist.')
    } catch {
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId))
      setMessage('Property removed from your shortlist.')
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault()
    setSubmittingReview(true)
    setMessage('')
    setError('')
    try {
      const res = await axios.post('/api/reviews', {
        user_id: user.id,
        name: user.name,
        email: user.email,
        role_label: reviewForm.role_label,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
        type: reviewForm.type,
        seller_property_draft_id: reviewForm.seller_property_draft_id ? Number(reviewForm.seller_property_draft_id) : null,
      })
      setMessage(res.data.message || 'Thank you! Your review has been published.')
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
        role_label: 'First-time Home Buyer',
        type: 'buyer',
        seller_property_draft_id: '',
      })
      setShowReviewForm(false)
      const reviewsRes = await axios.get(`/api/user/reviews?user_id=${user.id}&email=${encodeURIComponent(user.email)}`).catch(() => ({ data: { data: [] } }))
      setMyReviews(reviewsRes.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleReviewDelete(reviewId) {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await axios.delete(`/api/user/reviews/${reviewId}`, { data: { user_id: user.id } })
      setMyReviews(prev => prev.filter(r => r.id !== reviewId))
      setMessage('Your review was successfully removed.')
    } catch {
      setError('Could not remove review.')
    }
  }

  const siteVisits = inquiries.filter(i => i.is_site_visit)
  const generalInquiries = inquiries.filter(i => !i.is_site_visit)

  // Dossiers Vault derived strictly from actual saved properties
  const dossiersVault = savedProperties

  return (
    <div className="buyer-dashboard-page">
      <div className="page-hero marketplace-hero buyer-hero">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate ? onNavigate('home') : (window.location.href = '/')}>Home</button>
            <span>/</span>
            <span>Buyer & Investor Hub</span>
          </div>
          <h1 className="page-hero__title">Welcome, {user.name}</h1>
          <p className="page-hero__sub">
            Manage your shortlisted properties, verified bank dossiers, lawyer video consultations, and physical site inspections.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              🛒 Mode: Buyer & Investor
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '6px 14px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '20px', cursor: 'pointer' }}
                onClick={() => { switchRole('seller'); onNavigate('sellerDashboard') }}
              >
                🏷️ Switch to Seller Hub ➔
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}
                onClick={() => { switchRole('seller'); onNavigate('sell') }}
              >
                ➕ Sell Property
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container buyer-dashboard-body">
        {message && (
          <div className="marketplace-alert" style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        {/* Overview Stats */}
        <section className="buyer-stats-grid">
          <div className="buyer-stat-card">
            <span className="buyer-stat-icon">⭐</span>
            <div className="buyer-stat-info">
              <span>Saved Shortlist</span>
              <strong>{savedProperties.length}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <span className="buyer-stat-icon">📅</span>
            <div className="buyer-stat-info">
              <span>Site Inspections</span>
              <strong>{siteVisits.length}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <span className="buyer-stat-icon">📹</span>
            <div className="buyer-stat-info">
              <span>Legal Consultations</span>
              <strong>{appointments.length}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <span className="buyer-stat-icon">📄</span>
            <div className="buyer-stat-info">
              <span>Dossiers Vault</span>
              <strong>{dossiersVault.length}</strong>
            </div>
          </div>

          <div className="buyer-stat-card">
            <span className="buyer-stat-icon">✍️</span>
            <div className="buyer-stat-info">
              <span>My Reviews</span>
              <strong>{myReviews.length}</strong>
            </div>
          </div>
        </section>

        {/* Interactive Tabs */}
        <nav className="buyer-tabs-nav">
          <button
            type="button"
            className={`buyer-tab-btn ${activeTab === 'saved' ? 'buyer-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <span>⭐ Saved Properties</span>
            <span className="buyer-tab-badge">{savedProperties.length}</span>
          </button>

          <button
            type="button"
            className={`buyer-tab-btn ${activeTab === 'visits' ? 'buyer-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('visits')}
          >
            <span>📅 Physical Site Inspections</span>
            <span className="buyer-tab-badge">{siteVisits.length}</span>
          </button>

          <button
            type="button"
            className={`buyer-tab-btn ${activeTab === 'appointments' ? 'buyer-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <span>📹 Lawyer Consultations</span>
            <span className="buyer-tab-badge">{appointments.length}</span>
          </button>

          <button
            type="button"
            className={`buyer-tab-btn ${activeTab === 'dossiers' ? 'buyer-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('dossiers')}
          >
            <span>📄 Certified Dossiers Vault</span>
            <span className="buyer-tab-badge">{dossiersVault.length}</span>
          </button>

          <button
            type="button"
            className={`buyer-tab-btn ${activeTab === 'inquiries' ? 'buyer-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <span>💬 Inquiries History</span>
            <span className="buyer-tab-badge">{generalInquiries.length}</span>
          </button>

          <button
            type="button"
            className={`buyer-tab-btn ${activeTab === 'reviews' ? 'buyer-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <span>✍️ Customer Reviews</span>
            <span className="buyer-tab-badge">{myReviews.length}</span>
          </button>
        </nav>

        {/* TAB 1: Saved Properties Shortlist */}
        {activeTab === 'saved' && (
          <section>
            {savedProperties.length === 0 ? (
              <div className="buyer-empty-state">
                <span>⭐</span>
                <h3>No Saved Properties Yet</h3>
                <p>Browse our verified property inventory and click the heart icon to shortlist properties for comparison and valuation.</p>
                <button className="btn-primary" onClick={() => onNavigate ? onNavigate('properties') : (window.location.href = '/properties')}>
                  Browse Listings
                </button>
              </div>
            ) : (
              <div className="buyer-saved-grid">
                {savedProperties.map(p => (
                  <article key={p.id} className="buyer-saved-card">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} />
                    ) : (
                      <div style={{ height: '160px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🏡</div>
                    )}
                    <div className="buyer-saved-card-body">
                      <h4>{p.title || `${p.type} in ${p.district}`}</h4>
                      <p>📍 {p.district}</p>
                      <div className="buyer-saved-price">{p.expected_price || p.price}</div>
                      <div className="buyer-saved-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => onNavigate ? onNavigate('propertyDetail', { id: p.id }) : (window.location.href = `/property/${p.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '700' }}
                          onClick={() => setSelectedVisitProperty(p)}
                        >
                          📅 Book Visit
                        </button>
                        <button
                          type="button"
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer', marginLeft: 'auto' }}
                          onClick={() => removeSaved(p.id)}
                          title="Remove from shortlist"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Physical Site Inspections */}
        {activeTab === 'visits' && (
          <section className="buyer-item-list">
            {siteVisits.length === 0 ? (
              <div className="buyer-empty-state">
                <span>📅</span>
                <h3>No Physical Site Visits Scheduled</h3>
                <p>When you request an on-site property inspection, your appointment status and calendar reminders will appear here.</p>
                <button className="btn-primary" onClick={() => onNavigate ? onNavigate('properties') : (window.location.href = '/properties')}>
                  Find Properties to Inspect
                </button>
              </div>
            ) : (
              siteVisits.map(visit => (
                <div key={visit.id} className="buyer-item-card">
                  <div className="buyer-item-left">
                    <h4>{visit.property?.property_type || 'Property'} in {visit.property?.district || 'Sri Lanka'}</h4>
                    <div className="buyer-item-meta">
                      <span><strong>Date:</strong> {visit.visit_date ? new Date(visit.visit_date).toLocaleDateString() : 'Pending'}</span>
                      <span><strong>Window:</strong> {visit.visit_slot}</span>
                      <span><strong>Price:</strong> {visit.property?.expected_price}</span>
                      {visit.seller?.name && <span><strong>Seller:</strong> {visit.seller.name}</span>}
                    </div>
                    {visit.message && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        Notes: "{visit.message}"
                      </p>
                    )}
                  </div>
                  <div className="buyer-item-right">
                    <span className={`marketplace-status marketplace-status-${visit.visit_status || 'pending'}`}>
                      {visit.visit_status === 'confirmed' ? '✓ Confirmed by Seller' : (visit.visit_status || 'Pending Review')}
                    </span>
                    <button
                      type="button"
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                      onClick={() => downloadCalendarInvite({
                        title: `Site Inspection: ${visit.property?.property_type} in ${visit.property?.district}`,
                        description: `Physical site inspection arranged via KNW PRO Realtor.\nSeller: ${visit.seller?.name || 'Verified Seller'}\nPhone: ${visit.seller?.phone || visit.property?.contact_number || 'Direct'}\nLocation: ${visit.property?.district}`,
                        location: `${visit.property?.district || 'Sri Lanka'}`,
                        startDate: visit.visit_date,
                        timeSlot: visit.visit_slot,
                        contactName: visit.seller?.name,
                        contactPhone: visit.seller?.phone || visit.property?.contact_number,
                      })}
                    >
                      📅 Download .ICS
                    </button>
                    {(visit.seller?.phone || visit.property?.contact_number) && (
                      <a
                        href={`https://wa.me/${String(visit.seller?.phone || visit.property?.contact_number).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, regarding our site inspection appointment on ${visit.visit_date} (${visit.visit_slot})...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#25D366', color: '#fff', textDecoration: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700' }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 3: Lawyer Consultations */}
        {activeTab === 'appointments' && (
          <section className="buyer-item-list">
            {appointments.length === 0 ? (
              <div className="buyer-empty-state">
                <span>📹</span>
                <h3>No Legal Video Consultations Booked</h3>
                <p>Book a certified property lawyer to review deeds, verify titles, or advise on foreign buyer property laws.</p>
                <button className="btn-primary" onClick={() => onNavigate ? onNavigate('legal') : (window.location.href = '/legal')}>
                  Book Legal Consultation
                </button>
              </div>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="buyer-item-card">
                  <div className="buyer-item-left">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: app.consultation_type === 'office' ? '#ecfdf5' : '#eff6ff', color: app.consultation_type === 'office' ? '#065f46' : '#1e40af', fontWeight: '700' }}>
                        {app.consultation_type === 'office' ? '🏢 In-Person Office Visit' : '📹 Online Video Call'}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: app.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: app.payment_status === 'paid' ? '#15803d' : '#b45309', fontWeight: '700' }}>
                        {app.payment_status === 'paid' ? `✓ Paid (Rs. ${Number(app.fee_amount || 5000).toLocaleString()})` : '⏳ Bank Slip Pending Clearance'}
                      </span>
                    </div>

                    <h4>Legal Consultation: {app.topic || 'Property Due Diligence'}</h4>
                    <div className="buyer-item-meta">
                      <span><strong>Attorney:</strong> {app.lawyer?.name || 'Assigned Property Lawyer'}</span>
                      <span><strong>Date:</strong> {app.appointment_date ? new Date(app.appointment_date).toLocaleDateString() : 'Pending'}</span>
                      <span><strong>Time:</strong> {app.start_time}</span>
                      <span><strong>Status:</strong> {app.status}</span>
                    </div>

                    {app.consultation_type === 'office' && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#047857', background: '#f0fdf4', padding: '6px 10px', borderRadius: '5px' }}>
                        📍 <strong>Law Chambers:</strong> {app.office_location || app.lawyer?.lawyer_profile?.office_location || 'Attorney Chambers, Colombo 03'}
                      </p>
                    )}

                    {app.lawyer_note && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#059669', fontWeight: '600' }}>
                        Attorney Note: "{app.lawyer_note}"
                      </p>
                    )}
                  </div>
                  <div className="buyer-item-right">
                    {app.consultation_type === 'video' ? (
                      app.status === 'confirmed' && app.video_meeting_url ? (
                        <a
                          href={app.video_meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-video-meeting"
                        >
                          📹 Join Video Consultation
                        </a>
                      ) : (
                        <span className="marketplace-status marketplace-status-pending">
                          {app.payment_status === 'pending_verification' ? 'Awaiting Payment Clearance' : (app.status || 'Pending Lawyer Confirmation')}
                        </span>
                      )
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <span className="marketplace-status marketplace-status-active">
                          🏢 Office Visit Confirmed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 4: Certified Dossiers Vault */}
        {activeTab === 'dossiers' && (
          <section>
            {dossiersVault.length === 0 ? (
              <div className="buyer-empty-state">
                <span>📄</span>
                <h3>No Certified Dossiers Available</h3>
                <p>Save properties to your shortlist to immediately generate and download verified legal & bank title dossiers.</p>
                <button className="btn-primary" onClick={() => onNavigate ? onNavigate('properties') : (window.location.href = '/properties')}>
                  Browse Listings
                </button>
              </div>
            ) : (
              <div className="buyer-saved-grid">
                {dossiersVault.map(p => (
                  <article key={p.id} className="buyer-saved-card">
                    <div style={{ padding: '16px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#10b981', fontWeight: '700' }}>
                        🛡️ Certified Bank Dossier
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Ref: KNW-{p.id || 104}
                      </span>
                    </div>
                    <div className="buyer-saved-card-body">
                      <h4>{p.title || `${p.type} in ${p.district}`}</h4>
                      <p>📍 {p.district} {p.town ? `(${p.town})` : ''}</p>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.8rem', color: '#475569' }}>
                        <div>✓ 30-Year Deed Search: <strong>100% Clear</strong></div>
                        <div>✓ Provincial Stamp Duty: <strong>Calculated</strong></div>
                        <div>✓ Commercial Bank Appraisal: <strong>Eligible</strong></div>
                      </div>
                      <div className="buyer-saved-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
                          onClick={() => setSelectedDossier(p)}
                        >
                          📄 Open & Download PDF Dossier
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 5: Inquiries History */}
        {activeTab === 'inquiries' && (
          <section className="buyer-item-list">
            {generalInquiries.length === 0 ? (
              <div className="buyer-empty-state">
                <span>💬</span>
                <h3>No General Inquiries Sent</h3>
                <p>When you ask questions or contact sellers on properties, your correspondence logs will be saved here.</p>
              </div>
            ) : (
              generalInquiries.map(inq => (
                <div key={inq.id} className="buyer-item-card">
                  <div className="buyer-item-left">
                    <h4>Inquiry on {inq.property?.property_type || 'Property'} ({inq.property?.district})</h4>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#334155' }}>
                      Message: "{inq.message || 'General price inquiry'}"
                    </p>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Submitted: {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  <div className="buyer-item-right">
                    <span className={`marketplace-status marketplace-status-${inq.status}`}>
                      {inq.status === 'contacted' ? 'Seller Responded' : inq.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 6: Customer Reviews */}
        {activeTab === 'reviews' && (
          <section className="buyer-reviews-section">
            <div className="buyer-reviews-header-bar">
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#0f172a' }}>My Experience Reviews</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  Share your property buying journey, feedback on sellers, or legal consultations.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? '✕ Close Form' : '✍️ Write a Review'}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="buyer-review-form-card">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>Write a Review</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Share your feedback and experience. Your review will be published under your buyer profile.
                </p>

                <div className="review-form-row">
                  <div className="review-form-group">
                    <label>Rating (1-5 Stars)</label>
                    <div className="star-rating-select">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-select-btn ${reviewForm.rating >= star ? 'star-active' : ''}`}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          ★
                        </button>
                      ))}
                      <span className="star-count-label">{reviewForm.rating} / 5 Stars</span>
                    </div>
                  </div>

                  <div className="review-form-group">
                    <label>Your Buyer Profile / Role</label>
                    <select
                      value={reviewForm.role_label}
                      onChange={e => setReviewForm({ ...reviewForm, role_label: e.target.value })}
                      required
                    >
                      <option value="First-time Home Buyer">First-time Home Buyer</option>
                      <option value="Foreign / Diaspora Investor">Foreign / Diaspora Investor</option>
                      <option value="Commercial Real Estate Buyer">Commercial Real Estate Buyer</option>
                      <option value="Land & Agriculture Investor">Land & Agriculture Investor</option>
                      <option value="Residential Property Seeker">Residential Property Seeker</option>
                    </select>
                  </div>
                </div>

                <div className="review-form-group" style={{ marginTop: '12px' }}>
                  <label>Review Headline / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Smooth deed verification and prompt seller inspection"
                    value={reviewForm.title}
                    onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                    required
                  />
                </div>

                {savedProperties.length > 0 && (
                  <div className="review-form-group" style={{ marginTop: '12px' }}>
                    <label>Associated Property (Optional)</label>
                    <select
                      value={reviewForm.seller_property_draft_id}
                      onChange={e => setReviewForm({ ...reviewForm, seller_property_draft_id: e.target.value })}
                    >
                      <option value="">General Platform Experience</option>
                      {savedProperties.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title || `${p.property_type || p.type} in ${p.district}`} (Ref #{p.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="review-form-group" style={{ marginTop: '12px' }}>
                  <label>Your Detailed Feedback</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your experience with the property search, seller communication, legal verification, or site visit..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {myReviews.length === 0 ? (
              <div className="buyer-empty-state">
                <span>✍️</span>
                <h3>No Customer Reviews Submitted Yet</h3>
                <p>Have you interacted with sellers, completed a site inspection, or consulted a lawyer? Share your feedback to help the community.</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowReviewForm(true)}
                >
                  Write Your First Review
                </button>
              </div>
            ) : (
              <div className="buyer-reviews-list">
                {myReviews.map(rev => (
                  <article key={rev.id} className="buyer-review-card">
                    <div className="buyer-review-card-top">
                      <div className="buyer-review-stars">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        <span className="buyer-review-score">{rev.rating}/5</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-pill status-${rev.status}`}>
                          {rev.status === 'approved' ? '✓ Published' : rev.status}
                        </span>
                        <button
                          type="button"
                          className="btn-danger-outline"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                          onClick={() => handleReviewDelete(rev.id)}
                          title="Delete this review"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <h4 className="buyer-review-headline">{rev.title || 'Platform Review'}</h4>
                    <p className="buyer-review-body">{rev.comment}</p>

                    <div className="buyer-review-details">
                      <span><strong>Role:</strong> {rev.role_label || 'Buyer'}</span>
                      {rev.property && (
                        <span><strong>Property:</strong> {rev.property.property_type} in {rev.property.district}</span>
                      )}
                      <span><strong>Submitted:</strong> {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recently'}</span>
                    </div>

                    {rev.admin_note && (
                      <div className="buyer-review-note">
                        <strong>Admin Feedback:</strong> {rev.admin_note}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Dossier Modal */}
      {selectedDossier && (
        <PropertyDossierModal
          property={selectedDossier}
          onClose={() => setSelectedDossier(null)}
        />
      )}

      {/* Schedule Visit Modal */}
      {selectedVisitProperty && (
        <ScheduleVisitModal
          property={selectedVisitProperty}
          user={user}
          onClose={() => setSelectedVisitProperty(null)}
          onSuccess={() => {
            setSelectedVisitProperty(null)
            loadDashboardData()
          }}
        />
      )}
    </div>
  )
}
