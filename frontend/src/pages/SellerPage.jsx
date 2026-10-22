import axios from 'axios'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useSystemSettings } from '../context/SystemSettingsContext'
import AiDescriptionGenerator from '../components/AiDescriptionGenerator'
import PriceEstimator from '../components/PriceEstimator'
import './SellerPage.css'

const sriLankanDistricts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
]

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const sellerStats = [
  { value: '24h', label: 'Listing review' },
  { value: '18+', label: 'Buyer countries' },
  { value: '850+', label: 'Properties sold' },
  { value: '4.8', label: 'Seller rating' },
]

const listingSteps = [
  { title: 'Property details', text: 'Share location, price, photos, and the kind of buyers you want to attract.' },
  { title: 'Document check', text: 'Our team reviews ownership, survey, and identity details before publishing.' },
  { title: 'Buyer matching', text: 'Your property is shown to local and international buyers with verified interest.' },
]

const documents = [
  'Title deed or ownership document',
  'Survey plan',
  'NIC or passport copy',
  'Recent property tax receipt',
]

const listingPlans = [
  { id: 'basic', name: 'Basic Listing', price: 500, text: 'Submit 1 land or property listing for admin review.' },
  { id: 'verified', name: 'Verified Listing', price: 1000, text: 'Listing review plus basic document readiness check.' },
  { id: 'featured', name: 'Featured Listing', price: 2500, text: 'Priority listing review plus advisor follow-up.' },
]

const inquiries = [
  { name: 'Nadia Fernando', detail: 'Looking for a family house in Kandy', tag: 'High intent' },
  { name: 'James Miller', detail: 'Foreign buyer interested in coastal land', tag: 'Legal review' },
  { name: 'Ravi Senanayake', detail: 'Ready to visit this weekend', tag: 'Viewing' },
]

function Icon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

  if (type === 'check') {
    return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>
  }

  if (type === 'upload') {
    return (
      <svg {...common}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m17 8-5-5-5 5" />
        <path d="M12 3v12" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}

export default function SellerPage({ onNavigate }) {
  const { user, applyForSeller, switchRole } = useAuth()
  const { t } = useLanguage()

  const [applyForm, setApplyForm] = useState({
    phone: user?.phone || '',
    nic_number: user?.nic_number || '',
    address: user?.address || '',
    nic_document: null,
  })
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [applyErr, setApplyErr] = useState('')

  const handleApplySeller = async (e) => {
    e.preventDefault()
    setApplyLoading(true)
    setApplyMsg('')
    setApplyErr('')
    const res = await applyForSeller(applyForm)
    setApplyLoading(false)
    if (res.success) {
      setApplyMsg(res.message || 'Seller verification submitted successfully!')
    } else {
      setApplyErr(res.message || 'Failed to submit seller verification.')
    }
  }

  const isApprovedSeller = Boolean(user?.can?.list_property || (user?.role === 'seller' && user?.status === 'active') || user?.seller_status === 'active' || ['admin', 'staff'].includes(user?.role))
  const isPendingSeller = (user?.seller_status === 'pending') || (user?.role === 'seller' && user?.status === 'pending')
  const isRejectedSeller = (user?.seller_status === 'rejected') || (user?.role === 'seller' && user?.status === 'rejected')

  const [form, setForm] = useState(getEmptyForm(user))
  const [visitDateInput, setVisitDateInput] = useState('')
  const [documentsReady, setDocumentsReady] = useState([])
  const [propertyImages, setPropertyImages] = useState([])
  const [paymentSlip, setPaymentSlip] = useState(null)
  const [deedDoc, setDeedDoc] = useState(null)
  const [surveyPlanDoc, setSurveyPlanDoc] = useState(null)
  const [councilDoc, setCouncilDoc] = useState(null)
  const [otherDoc, setOtherDoc] = useState(null)
  const [cardPayLoading, setCardPayLoading] = useState(false)
  const [consent, setConsent] = useState({
    terms_accepted: false,
    visit_permission: false,
    review_acknowledged: false,
  })
  const [submitState, setSubmitState] = useState({ loading: false, message: '', error: '' })
  const [showAiModal, setShowAiModal] = useState(false)
  const [showEstimatorModal, setShowEstimatorModal] = useState(false)
  const { settings } = useSystemSettings()
  const activePlans = settings?.seller_packages?.listing_plans || listingPlans
  const selectedPlan = activePlans.find(plan => plan.id === form.listing_plan) || activePlans[0]

  const setField = (key, value) => {
    setSubmitState({ loading: false, message: '', error: '' })
    setForm(current => ({ ...current, [key]: value }))
  }

  const toggleDocument = (doc) => {
    setSubmitState({ loading: false, message: '', error: '' })
    setDocumentsReady(current => current.includes(doc) ? current.filter(item => item !== doc) : [...current, doc])
  }

  const toggleVisitDay = (day) => {
    setForm(current => ({
      ...current,
      visit_days: current.visit_days.includes(day)
        ? current.visit_days.filter(item => item !== day)
        : [...current.visit_days, day],
    }))
  }

  const addVisitDate = () => {
    if (!visitDateInput || form.visit_dates.includes(visitDateInput)) return
    setField('visit_dates', [...form.visit_dates, visitDateInput])
    setVisitDateInput('')
  }

  const removeVisitDate = (date) => {
    setField('visit_dates', form.visit_dates.filter(item => item !== date))
  }

  const toggleConsent = (key) => {
    setSubmitState({ loading: false, message: '', error: '' })
    setConsent(current => ({ ...current, [key]: !current[key] }))
  }

  const submitDraft = async (event) => {
    event.preventDefault()
    setSubmitState({ loading: true, message: '', error: '' })

    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => payload.append(`${key}[]`, item))
        } else if (value !== null && value !== undefined) {
          payload.append(key, value)
        }
      })
      documentsReady.forEach(doc => payload.append('documents[]', doc))
      propertyImages.forEach(file => payload.append('property_images[]', file))
      if (paymentSlip) payload.append('payment_slip', paymentSlip)
      if (deedDoc) payload.append('deed_document', deedDoc)
      if (surveyPlanDoc) payload.append('survey_plan', surveyPlanDoc)
      if (councilDoc) payload.append('council_document', councilDoc)
      if (otherDoc) payload.append('other_document', otherDoc)
      Object.entries(consent).forEach(([key, value]) => payload.append(key, value ? '1' : '0'))

      if (user?.id) payload.append('seller_id', user.id)
      if (user?.name) payload.append('seller_name', user.name)
      if (user?.email) payload.append('seller_email', user.email)

      const res = await axios.post('/api/seller/listings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSubmitState({ loading: false, message: res.data.message, error: '' })
      setForm(getEmptyForm(user))
      setVisitDateInput('')
      setDocumentsReady([])
      setPropertyImages([])
      setPaymentSlip(null)
      setDeedDoc(null)
      setSurveyPlanDoc(null)
      setCouncilDoc(null)
      setOtherDoc(null)
      setConsent({ terms_accepted: false, visit_permission: false, review_acknowledged: false })
    } catch (error) {
      setSubmitState({
        loading: false,
        message: '',
        error: getApiError(error, 'Could not send this draft to admin review.'),
      })
    }
  }

  const startCardPayment = async () => {
    if (!form.contact_number) {
      setSubmitState({
        loading: false,
        message: '',
        error: 'Enter your contact number before starting online card payment.',
      })
      return
    }

    setCardPayLoading(true)
    setSubmitState({ loading: false, message: '', error: '' })

    try {
      const res = await axios.post('/api/payments/payhere/checkout', {
        listing_plan: form.listing_plan,
        name: user?.name || 'Seller',
        email: user?.email || 'seller@example.com',
        phone: form.contact_number,
        district: form.district,
        user_id: user?.id || null,
      })

      if (res.data.demo) {
        setSubmitState({
          loading: false,
          message: `${res.data.message} Order ${res.data.order_id} for ${res.data.currency} ${res.data.amount}.`,
          error: '',
        })
        return
      }

      const payForm = document.createElement('form')
      payForm.method = 'POST'
      payForm.action = res.data.action_url
      Object.entries(res.data.fields).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value || ''
        payForm.appendChild(input)
      })
      document.body.appendChild(payForm)
      payForm.submit()
    } catch (error) {
      setSubmitState({
        loading: false,
        message: '',
        error: getApiError(error, 'Online card payment is not configured yet.'),
      })
    } finally {
      setCardPayLoading(false)
    }
  }

  return (
    <div className="page seller-page">
      <section className="seller-hero">
        <div className="container seller-hero__inner">
          <div className="seller-hero__content">
            <div className="breadcrumb seller-breadcrumb">
              <button onClick={() => onNavigate('home')}>Home</button>
              <span>/</span>
              <span>{t('seller.breadcrumb')}</span>
            </div>
            <span className="seller-kicker">{t('seller.kicker')}</span>
            <h1>{t('seller.title')}</h1>
            <p>{t('seller.subtitle')}</p>
            <div className="seller-hero__actions">
              <button className="btn-primary" onClick={() => onNavigate('register', { role: 'seller' })}>{t('seller.start')}</button>
              <button className="btn-white seller-ghost-btn" onClick={() => onNavigate('reviews')}>{t('seller.reviews')}</button>
            </div>
          </div>

          <div className="seller-hero__visual seller-listing-preview" aria-label="Property listing preview">
            <div className="seller-preview-card">
              <div className="seller-preview-card__media">
                <div className="seller-preview-card__roof" />
                <div className="seller-preview-card__house">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="seller-preview-card__garden" />
              </div>
              <div className="seller-preview-card__body">
                <div>
                  <span className="seller-preview-tag">Featured review</span>
                  <h3>Verified property listing</h3>
                  <p>Photos, location, visit times, payment slip and seller documents in one admin-ready draft.</p>
                </div>
                <div className="seller-preview-meta">
                  <span>25 districts</span>
                  <span>Map ready</span>
                  <span>Photo upload</span>
                </div>
              </div>
            </div>
            <div className="seller-health-panel">
              <div>
                <span>Listing readiness</span>
                <strong>92%</strong>
              </div>
              <div className="seller-health-ring" aria-hidden="true">
                <span>92</span>
              </div>
            </div>
            <div className="seller-hero-checklist">
              <span>Ready for admin review</span>
              <span>Payment proof attached</span>
              <span>Buyer visits scheduled</span>
            </div>
          </div>
        </div>
      </section>

      <section className="seller-stats">
        <div className="container seller-stats__inner">
          {sellerStats.map(item => (
            <div className="seller-stat" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="container seller-body">
        <section className="seller-intake">
          {!isApprovedSeller && !isPendingSeller && !isRejectedSeller ? (
            <div className="seller-panel" style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '40px 32px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              margin: '0 auto',
              maxWidth: '740px',
              width: '100%'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  margin: '0 auto 16px'
                }}>
                  🏷️
                </div>
                <span className="seller-kicker" style={{ color: '#d97706', fontWeight: '700' }}>
                  Upgrade Existing Account
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#1e293b', margin: '8px 0 10px' }}>
                  Activate Seller Privileges on Your Account
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.96rem', lineHeight: '1.65', maxWidth: '580px', margin: '0 auto' }}>
                  You are signed in as <strong>{user?.name}</strong> (<code>{user?.email}</code>).
                  <br />
                  No need to register a second account! Submit your identity verification below to start listing properties for sale.
                </p>
              </div>

              {applyMsg && (
                <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                  ✅ {applyMsg}
                </div>
              )}
              {applyErr && (
                <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                  ⚠️ {applyErr}
                </div>
              )}

              <form onSubmit={handleApplySeller} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+94 77 123 4567"
                      value={applyForm.phone}
                      onChange={e => setApplyForm(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      National ID / Passport Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 199012345678 or N1234567"
                      value={applyForm.nic_number}
                      onChange={e => setApplyForm(prev => ({ ...prev, nic_number: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Residential / Business Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Galle Road, Colombo 03"
                    value={applyForm.address}
                    onChange={e => setApplyForm(prev => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    NIC / Passport Verification Document (PDF or Photo)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setApplyForm(prev => ({ ...prev, nic_document: e.target.files[0] || null }))}
                    style={{ width: '100%', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#f8fafc' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Upload a clear photo or scan of your NIC or Passport for manual verification (Max 5MB).
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={applyLoading}
                    style={{ flex: 1, minWidth: '200px', padding: '12px 20px', fontSize: '15px', fontWeight: '600' }}
                  >
                    {applyLoading ? 'Submitting Verification...' : '🚀 Submit Seller Verification'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { switchRole('buyer'); onNavigate('buyerDashboard') }}
                    style={{ padding: '12px 20px', fontSize: '14px' }}
                  >
                    🛒 Stay in Buyer Mode
                  </button>
                </div>
              </form>
            </div>
          ) : isPendingSeller ? (
            <div className="seller-panel" style={{
              gridColumn: '1 / -1',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              margin: '0 auto',
              maxWidth: '740px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                margin: '0 auto 18px'
              }}>
                ⏳
              </div>
              <span className="seller-kicker" style={{ color: '#d97706', fontWeight: '700' }}>
                Seller Verification In Progress
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#92400e', margin: '8px 0 14px' }}>
                Identity Documents Awaiting Admin Review
              </h2>
              <p style={{ color: '#78350f', fontSize: '0.96rem', lineHeight: '1.65', marginBottom: '28px', maxWidth: '600px', margin: '0 auto 24px' }}>
                Hello <strong>{user?.name}</strong>, your seller identity verification is currently being reviewed by the KNW Admin.
                <br /><br />
                Your account remains <strong>100% active in Buyer Mode</strong> so you can continue searching, saving properties, and booking visits without interruption!
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                  onClick={() => { switchRole('seller'); onNavigate('sellerDashboard') }}
                >
                  🏷️ View Status in Seller Dashboard
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                  onClick={() => { switchRole('buyer'); onNavigate('buyerDashboard') }}
                >
                  🛒 Go to Buyer Dashboard
                </button>
              </div>
            </div>
          ) : isRejectedSeller ? (
            <div className="seller-panel" style={{
              gridColumn: '1 / -1',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              margin: '0 auto',
              maxWidth: '740px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                margin: '0 auto 18px'
              }}>
                ❌
              </div>
              <span className="seller-kicker" style={{ color: '#dc2626', fontWeight: '700' }}>
                Verification Update
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#991b1b', margin: '8px 0 14px' }}>
                Seller Verification Not Approved
              </h2>
              <p style={{ color: '#7f1d1d', fontSize: '0.96rem', lineHeight: '1.65', marginBottom: '24px' }}>
                Reason: <strong>{user?.rejection_reason || 'Identity documents could not be verified'}</strong>.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  user.seller_status = 'none'
                  setApplyErr('')
                }}
              >
                🔄 Re-submit Seller Verification
              </button>
            </div>
          ) : (
            <>
              <div className="seller-panel seller-form-panel">
                <div className="seller-panel__head">
              <span className="seller-kicker">{t('seller.newListing')}</span>
              <h2>{t('seller.formTitle')}</h2>
              <p>{t('seller.formSub')}</p>
            </div>

            {(submitState.message || submitState.error) && (
              <div className={`seller-form-alert ${submitState.error ? 'seller-form-alert--error' : ''}`}>
                {submitState.error || submitState.message}
              </div>
            )}

            <form className="seller-form" onSubmit={submitDraft}>
              <div className="seller-plan-picker seller-form__wide">
                <div className="seller-consent__head">
                  <span className="seller-kicker">Listing subscription</span>
                  <h3>Choose how you want to submit your property</h3>
                  <p>Small listing fees help us review seller details and keep buyer inquiries serious.</p>
                </div>
                <div className="seller-plan-grid">
                  {activePlans.map(plan => (
                    <label className={form.listing_plan === plan.id ? 'seller-plan seller-plan--active' : 'seller-plan'} key={plan.id}>
                      <input type="radio" name="listing_plan" value={plan.id} checked={form.listing_plan === plan.id} onChange={e => setField('listing_plan', e.target.value)} />
                      <strong>{plan.name}</strong>
                      <span>Rs. {Number(plan.price).toLocaleString()}</span>
                      <em>{plan.text}</em>
                    </label>
                  ))}
                </div>
              </div>

              <label>
                {t('seller.propertyType')}
                <select value={form.property_type} onChange={e => setField('property_type', e.target.value)} required>
                  <option value="" disabled>{t('seller.selectType')}</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Villa">Villa</option>
                </select>
              </label>
              <label>
                {t('seller.district')}
                <select value={form.district} onChange={e => setField('district', e.target.value)} required>
                  <option value="" disabled>{t('seller.selectDistrict')}</option>
                  {sriLankanDistricts.map(district => <option value={district} key={district}>{district}</option>)}
                </select>
              </label>
              <label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span>{t('seller.price')}</span>
                  <button
                    type="button"
                    style={{ background: '#e1f5ee', border: '1px solid #10b981', color: '#0f6e56', fontSize: '11px', fontWeight: '700', borderRadius: '12px', padding: '2px 8px', cursor: 'pointer' }}
                    onClick={() => setShowEstimatorModal(true)}
                  >
                    📊 Estimate Market Price
                  </button>
                </div>
                <input value={form.expected_price} onChange={e => setField('expected_price', e.target.value)} placeholder="LKR 45,000,000" required />
              </label>
              <label>
                {t('seller.contact')}
                <input value={form.contact_number} onChange={e => setField('contact_number', e.target.value)} placeholder="+94 77 123 4567" required />
              </label>
              <label className="seller-form__wide">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span>{t('seller.description')}</span>
                  <button
                    type="button"
                    style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', borderRadius: '14px', padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setShowAiModal(true)}
                  >
                    ✨ Generate with AI Assistant
                  </button>
                </div>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder={t('seller.descriptionPlaceholder')} rows="4" />
              </label>

              <div className="seller-form__wide seller-availability">
                <div className="seller-consent__head">
                  <span className="seller-kicker">Visit availability</span>
                  <h3>Add exact dates or weekly days</h3>
                  <p>You can add one date, many dates, one weekday, or several weekdays.</p>
                </div>
                <div className="seller-date-add">
                  <label>
                    Add visit date
                    <input type="date" value={visitDateInput} onChange={e => setVisitDateInput(e.target.value)} />
                  </label>
                  <button type="button" onClick={addVisitDate}>Add date</button>
                </div>
                <div className="seller-chip-row">
                  {form.visit_dates.length === 0 && <span>No exact dates selected</span>}
                  {form.visit_dates.map(date => (
                    <button type="button" key={date} onClick={() => removeVisitDate(date)}>{date} x</button>
                  ))}
                </div>
                <div className="seller-weekday-grid">
                  {weekdays.map(day => (
                    <label className="seller-check-chip" key={day}>
                      <input type="checkbox" checked={form.visit_days.includes(day)} onChange={() => toggleVisitDay(day)} />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
                <label>
                  {t('seller.visitTime')}
                  <select value={form.visit_time} onChange={e => setField('visit_time', e.target.value)}>
                    <option value="" disabled>{t('seller.selectTime')}</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Call me first">Call me first</option>
                  </select>
                </label>
              </div>

              <div className="seller-form__wide seller-location-box">
                <div className="seller-consent__head">
                  <span className="seller-kicker">Real map location</span>
                  <h3>Add Google Maps link or coordinates</h3>
                  <p>Paste a Google Maps share link, or enter latitude and longitude if you have exact GPS coordinates.</p>
                </div>
                <label>
                  Google Maps location URL
                  <input value={form.location_url} onChange={e => setField('location_url', e.target.value)} placeholder="https://maps.google.com/..." />
                </label>
                <div className="seller-payment-grid">
                  <label>
                    Latitude
                    <input value={form.latitude} onChange={e => setField('latitude', e.target.value)} placeholder="6.927079" />
                  </label>
                  <label>
                    Longitude
                    <input value={form.longitude} onChange={e => setField('longitude', e.target.value)} placeholder="79.861244" />
                  </label>
                </div>
              </div>

              <div className="seller-form__wide seller-upload-zone">
                <div className="seller-consent__head">
                  <span className="seller-kicker">Property images</span>
                  <h3>Upload one or more property photos</h3>
                  <p>Accepted: JPG, PNG, WEBP. Upload clear photos of the property, road access, front view, and surroundings.</p>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => setPropertyImages(Array.from(e.target.files || []))} />
                <div className="seller-file-list">
                  {propertyImages.length === 0 && <span>No property images selected</span>}
                  {propertyImages.map(file => <span key={file.name}>{file.name}</span>)}
                </div>
              </div>

              <div className="seller-payment seller-form__wide">
                <div className="seller-consent__head">
                  <span className="seller-kicker">Payment confirmation</span>
                  <h3>Pay Rs. {selectedPlan.price.toLocaleString()} for {selectedPlan.name}</h3>
                  <p>For now you can upload a bank/mobile payment slip. Online card payments need a real payment gateway account and API keys.</p>
                </div>
                <div className="seller-payment-details">
                  <strong>Bank transfer / mobile payment</strong>
                  <span>Account: KNW PRO REALTOR</span>
                  <span>Reference: Your name + contact number</span>
                </div>
                <div className="seller-payment-grid">
                  <label>
                    Payment method
                    <select value={form.payment_method} onChange={e => setField('payment_method', e.target.value)} required>
                      <option value="Bank transfer">Bank transfer</option>
                      <option value="Mobile payment">Mobile payment</option>
                      <option value="Cash deposit">Cash deposit</option>
                      <option value="Online card payment">Online card payment</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label>
                    Payment reference
                    <input value={form.payment_reference} onChange={e => setField('payment_reference', e.target.value)} placeholder="Receipt / transaction number" required={form.payment_method !== 'Online card payment'} />
                  </label>
                  <label>
                    Upload payment slip
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPaymentSlip(e.target.files?.[0] || null)} />
                  </label>
                  <label>
                    Selected slip
                    <input value={paymentSlip?.name || 'No slip selected'} readOnly />
                  </label>
                  <label className="seller-form__wide">
                    Payment note
                    <textarea value={form.payment_note} onChange={e => setField('payment_note', e.target.value)} rows="3" placeholder="Any bank branch, sender name, or payment note" />
                  </label>
                </div>
                {form.payment_method === 'Online card payment' && (
                  <div className="seller-online-note">
                    <span>Card payment supports local demo checkout now. Add real PayHere merchant keys before collecting real money.</span>
                    <button type="button" onClick={startCardPayment} disabled={cardPayLoading}>
                      {cardPayLoading ? 'Preparing checkout...' : 'Pay online by card'}
                    </button>
                  </div>
                )}
              </div>

              <div className="seller-consent seller-form__wide">
                <div className="seller-consent__head">
                  <span className="seller-kicker">{t('seller.agreement')}</span>
                  <h3>{t('seller.confirmTitle')}</h3>
                  <p>{t('seller.confirmText')}</p>
                </div>
                <label className="seller-consent-option">
                  <input type="checkbox" checked={consent.terms_accepted} onChange={() => toggleConsent('terms_accepted')} required />
                  <span>{t('seller.ownerConsent')}</span>
                </label>
                <label className="seller-consent-option">
                  <input type="checkbox" checked={consent.visit_permission} onChange={() => toggleConsent('visit_permission')} required />
                  <span>{t('seller.visitConsent')}</span>
                </label>
                <label className="seller-consent-option">
                  <input type="checkbox" checked={consent.review_acknowledged} onChange={() => toggleConsent('review_acknowledged')} required />
                  <span>{t('seller.reviewConsent')}</span>
                </label>
              </div>
              <button type="submit" className="seller-submit" disabled={submitState.loading}>
                <Icon type="home" />
                {submitState.loading ? t('seller.sending') : t('seller.send')}
              </button>
            </form>
          </div>

          <aside className="seller-panel seller-checklist">
            <div className="seller-panel__head">
              <span className="seller-kicker">🛡️ Lawyer Title Clearance</span>
              <h2>Upload Property Legal Documents</h2>
              <p>Submit your property's legal documents for 30-year deed chain and surveyor clearance by certified panel attorneys.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              {/* Title Deed */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  📄 Title Deed / Extract Copy (PDF / Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setDeedDoc(e.target.files?.[0] || null)}
                  style={{ fontSize: '12px', width: '100%' }}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  {deedDoc ? `✓ Selected: ${deedDoc.name}` : 'Primary Deed of Transfer, Gift, or Partition decree.'}
                </small>
              </div>

              {/* Survey Plan */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  📐 Registered Survey Plan (PDF / Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setSurveyPlanDoc(e.target.files?.[0] || null)}
                  style={{ fontSize: '12px', width: '100%' }}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  {surveyPlanDoc ? `✓ Selected: ${surveyPlanDoc.name}` : 'Surveyor boundary plan certified with local council approval.'}
                </small>
              </div>

              {/* Council Clearance */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  🏛️ Local Council Clearance (Street Line / Non-Vesting)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setCouncilDoc(e.target.files?.[0] || null)}
                  style={{ fontSize: '12px', width: '100%' }}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  {councilDoc ? `✓ Selected: ${councilDoc.name}` : 'Street line / non-vesting certificate from municipal or urban council.'}
                </small>
              </div>

              {/* Other Documents */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  📎 Other Supporting Legal Documents (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setOtherDoc(e.target.files?.[0] || null)}
                  style={{ fontSize: '12px', width: '100%' }}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  {otherDoc ? `✓ Selected: ${otherDoc.name}` : 'Prior deeds, power of attorney, or municipal assessment receipts.'}
                </small>
              </div>
            </div>

            <div className="seller-side-note" style={{ marginTop: '14px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              🛡️ <strong>Lawyer Review Guarantee:</strong> All uploaded deeds are securely routed to registered property lawyers. Only listings cleared by attorneys earn the official <strong>KNW Certified Deed Verified</strong> badge!
            </div>
          </aside>
        </>
      )}
    </section>

        <section className="seller-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('seller.howTitle')}</h2>
              <p className="section-subtitle">{t('seller.howSub')}</p>
            </div>
          </div>
          <div className="seller-steps">
            {listingSteps.map((step, index) => (
              <article className="seller-step" key={step.title}>
                <span className="seller-step__number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="seller-dashboard">
          <div className="seller-panel seller-performance">
            <div className="seller-panel__head">
              <span className="seller-kicker">Live preview</span>
              <h2>Seller performance</h2>
              <p>See what your dashboard will track once your listing is active.</p>
            </div>
            <div className="seller-chart" aria-label="Listing views chart">
              <span style={{ height: '42%' }} />
              <span style={{ height: '65%' }} />
              <span style={{ height: '58%' }} />
              <span style={{ height: '82%' }} />
              <span style={{ height: '74%' }} />
              <span style={{ height: '94%' }} />
            </div>
            <div className="seller-performance__meta">
              <span>1,284 views</span>
              <span>36 inquiries</span>
              <span>9 viewings</span>
            </div>
          </div>

          <div className="seller-panel seller-inquiries">
            <div className="seller-panel__head">
              <span className="seller-kicker">Buyer interest</span>
              <h2>Recent inquiries</h2>
            </div>
            <div className="seller-inquiry-list">
              {inquiries.map(item => (
                <div className="seller-inquiry" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <em>{item.tag}</em>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showAiModal && (
        <AiDescriptionGenerator
          currentType={form.property_type || 'House'}
          currentDistrict={form.district || 'Colombo'}
          onApply={desc => setField('description', desc)}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {showEstimatorModal && (
        <PriceEstimator
          onClose={() => setShowEstimatorModal(false)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

function getEmptyForm(user) {
  return {
    property_type: '',
    district: '',
    expected_price: '',
    contact_number: user?.phone || '',
    description: '',
    visit_dates: [],
    visit_days: [],
    visit_time: '',
    location_url: '',
    latitude: '',
    longitude: '',
    listing_plan: 'basic',
    payment_method: 'Bank transfer',
    payment_reference: '',
    payment_note: '',
  }
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}
