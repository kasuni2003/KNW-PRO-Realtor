import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import './BlogPage.css'
import './LegalPage.css'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const lawGroups = [
  {
    title: 'Ownership and transfer',
    items: [
      {
        law: 'Registration of Documents Ordinance',
        note: 'Deeds, mortgages, leases and other land instruments should be registered at the relevant Land Registry so priority and ownership history can be checked.',
      },
      {
        law: 'Notaries Ordinance',
        note: 'Property deeds are normally prepared and attested by a notary. Buyers should verify the notary, parties, execution, witnesses, and deed chain.',
      },
      {
        law: 'Stamp Duty law and provincial rules',
        note: 'Transfers normally require stamp duty before registration. Rates and payment process can depend on the province and instrument type.',
      },
      {
        law: 'Prevention of Frauds Ordinance',
        note: 'Land sale agreements and transfers must be properly written, signed, and legally executed to be enforceable.',
      },
    ],
  },
  {
    title: 'Land type and title risks',
    items: [
      {
        law: 'Land Development Ordinance',
        note: 'State grant or permit land can carry restrictions on sale, mortgage, inheritance, and transfer. Always check the grant or permit conditions.',
      },
      {
        law: 'State Lands Ordinance and Crown/state land rules',
        note: 'State land cannot be treated like private freehold land. Confirm whether the seller has transferable rights.',
      },
      {
        law: 'Land Reform Law',
        note: 'Large landholdings and certain agricultural land may be affected by Land Reform Commission rules or historical vesting issues.',
      },
      {
        law: 'Prescription Ordinance',
        note: 'Long possession claims can affect land disputes. Physical possession and boundary occupation should be checked before buying.',
      },
    ],
  },
  {
    title: 'Special property situations',
    items: [
      {
        law: 'Apartment Ownership Law',
        note: 'Condominiums require condominium plans, management corporation details, common-element rules, and unit title checks.',
      },
      {
        law: 'Partition Law',
        note: 'Co-owned land, inherited land, and undivided shares can create sale problems. Check pending partition cases and all co-owner consent.',
      },
      {
        law: 'Urban Development Authority and local authority planning rules',
        note: 'Buildings, subdivisions, access roads, certificates of conformity, and development approvals should be checked with the correct authority.',
      },
      {
        law: 'Local authority by-laws',
        note: 'Street lines, drainage, building limits, assessment tax, and occupancy approvals may vary by council area.',
      },
    ],
  },
  {
    title: 'Foreign buyers and money flow',
    items: [
      {
        law: 'Land (Restrictions on Alienation) Act',
        note: 'Foreign ownership of land is restricted, with specific exceptions and structures. Foreign buyers need legal advice before paying deposits.',
      },
      {
        law: 'Foreign Exchange Act and Central Bank directions',
        note: 'Foreign funds for property purchases usually need to come through permitted banking channels and approved account structures.',
      },
      {
        law: 'Company ownership and shareholding restrictions',
        note: 'If a company has foreign ownership, special land-transfer restrictions can apply. Check the shareholding structure before purchase.',
      },
      {
        law: 'Lease rules for non-citizens',
        note: 'Long leases may be possible in some cases, but terms, taxes, approvals, and restrictions must be checked before signing.',
      },
    ],
  },
]

const buyerChecks = [
  'Verify the title deed chain for at least 30 years where possible.',
  'Search the Land Registry for prior deeds, mortgages, caveats, seizures, leases, and court orders.',
  'Match the survey plan, boundaries, access road, and physical occupation on site.',
  'Check seller identity, marital status where relevant, company authority, powers of attorney, and co-owner consent.',
  'Confirm local authority street lines, building approvals, certificate of conformity, and assessment tax status.',
  'Do not pay large deposits before written terms, refund conditions, and lawyer review are complete.',
]

const sellerChecks = [
  'Prepare title deed, survey plan, tax receipts, building approvals, and utility details before listing.',
  'Disclose mortgages, leases, disputes, access issues, co-ownership, permits, and pending cases.',
  'Give written permission for site visits only to trusted representatives and keep a record.',
  'Use a notary or lawyer to prepare the sale agreement and final deed.',
  'Confirm settlement method, bank details, taxes, broker fees, and handover date in writing.',
  'Do not hand over original deeds unless the process and custody are clearly documented.',
]

const timeline = [
  ['1', 'Initial review', 'Collect deed, plan, ID, price, land type, and seller authority.'],
  ['2', 'Due diligence', 'Lawyer and surveyor verify title, registry records, boundaries, approvals, and disputes.'],
  ['3', 'Agreement', 'Parties sign a properly drafted agreement with deposit, timeline, default, and refund terms.'],
  ['4', 'Payment and deed', 'Final deed is attested by a notary and payment is completed through agreed channels.'],
  ['5', 'Registration', 'Stamp duty and registration are completed at the relevant Land Registry.'],
  ['6', 'Handover', 'Buyer receives possession, keys, original documents, tax receipts, and utility transfer details.'],
]

const sources = [
  ['Land (Restrictions on Alienation) Act, No. 38 of 2014', 'https://www.documents.gov.lk/files/act/2014/10/38-2014_E.pdf'],
  ['Registrar General Department', 'https://www.rgd.gov.lk/'],
  ['Central Bank of Sri Lanka', 'https://www.cbsl.gov.lk/'],
  ['Condominium Management Authority', 'https://cma.gov.lk/'],
  ['Land Commissioner General Department', 'https://landcom.gov.lk/'],
  ['Urban Development Authority', 'https://www.uda.gov.lk/'],
]

const emptyAppointment = {
  lawyer_id: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  appointment_date: '',
  start_time: '',
  topic: '',
  message: '',
  consultation_type: 'video', // 'video' or 'office'
  user_role: 'buyer', // 'buyer' or 'seller'
  payment_method: 'online', // 'online' or 'bank_transfer'
  payment_reference: '',
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function LegalPage({ onNavigate }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [lawyers, setLawyers] = useState([])
  const [appointment, setAppointment] = useState(emptyAppointment)
  const [bankSlipFile, setBankSlipFile] = useState(null)
  const [submittingBooking, setSubmittingBooking] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [userAppointments, setUserAppointments] = useState([])

  useEffect(() => {
    if (!user) return
    async function loadUserAppointments() {
      try {
        const res = await axios.get(`/api/user/appointments?user_id=${user.id || ''}&email=${user.email || ''}`)
        setUserAppointments(res.data.data || [])
      } catch {
        // ignore
      }
    }
    loadUserAppointments()
  }, [user, bookingMessage])

  useEffect(() => {
    async function loadLawyers() {
      try {
        const res = await axios.get('/api/lawyers')
        const availableLawyers = res.data.data || []
        setLawyers(availableLawyers)
        if (availableLawyers[0]) {
          setAppointment(current => ({ ...current, lawyer_id: String(availableLawyers[0].id) }))
        }
      } catch {
        setBookingError('Could not load lawyers right now.')
      }
    }
    loadLawyers()
  }, [])

  useEffect(() => {
    if (!user) return
    setAppointment(current => ({
      ...current,
      customer_name: current.customer_name || user.name || '',
      customer_email: current.customer_email || user.email || '',
      customer_phone: current.customer_phone || user.phone || '',
    }))
  }, [user])

  const selectedLawyer = useMemo(
    () => lawyers.find(lawyer => String(lawyer.id) === String(appointment.lawyer_id)),
    [lawyers, appointment.lawyer_id]
  )

  const selectedSchedule = selectedLawyer?.lawyer_availability || []
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!appointment.lawyer_id || !appointment.appointment_date) {
      return
    }

    async function loadSlots() {
      setSlotsLoading(true)
      setBookingError('')
      try {
        const res = await axios.get(`/api/lawyers/${appointment.lawyer_id}/slots?date=${appointment.appointment_date}`)
        const slots = res.data.data || []
        setAvailableSlots(slots)
        setAppointment(current => ({
          ...current,
          start_time: slots.some(slot => slot.start_time === current.start_time) ? current.start_time : '',
        }))
      } catch {
        setAvailableSlots([])
        setBookingError('Could not load available times for this date.')
      } finally {
        setSlotsLoading(false)
      }
    }

    loadSlots()
  }, [appointment.lawyer_id, appointment.appointment_date])

  async function bookAppointment(event) {
    event.preventDefault()
    setBookingMessage('')
    setBookingError('')
    setSubmittingBooking(true)
    try {
      const formData = new FormData()
      formData.append('lawyer_id', appointment.lawyer_id)
      if (user?.id) formData.append('user_id', user.id)
      formData.append('customer_name', appointment.customer_name)
      formData.append('customer_email', appointment.customer_email)
      formData.append('customer_phone', appointment.customer_phone || '')
      formData.append('appointment_date', appointment.appointment_date)
      formData.append('start_time', appointment.start_time)
      formData.append('topic', appointment.topic)
      formData.append('message', appointment.message || '')
      formData.append('consultation_type', appointment.consultation_type)
      formData.append('user_role', user?.role || appointment.user_role)
      formData.append('payment_method', appointment.payment_method)
      formData.append('payment_reference', appointment.payment_reference || '')
      if (bankSlipFile) {
        formData.append('bank_slip', bankSlipFile)
      }

      const res = await axios.post('/api/appointments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setBookingMessage(res.data.message || 'Consultation appointment confirmed.')
      setAppointment({
        ...emptyAppointment,
        lawyer_id: appointment.lawyer_id,
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
      })
      setBankSlipFile(null)
    } catch (err) {
      setBookingError(getApiError(err, 'Could not book this appointment. Please check the selected lawyer schedule.'))
    } finally {
      setSubmittingBooking(false)
    }
  }

  return (
    <div className="page legal-page">
      <div className="page-hero legal-page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span>/</span>
            <span>{t('legalPage.breadcrumb')}</span>
          </div>
          <span className="legal-page-kicker">{t('legalPage.kicker')}</span>
          <h1 className="page-hero__title">{t('legalPage.title')}</h1>
          <p className="page-hero__sub">
            {t('legalPage.subtitle')}
          </p>
          <div className="legal-hero-actions">
            <button className="btn-primary" onClick={() => onNavigate('sell')}>{t('legalPage.prepareDocs')}</button>
            <button className="btn-white" onClick={() => onNavigate('blog')}>{t('legalPage.readArticles')}</button>
          </div>
        </div>
      </div>

      <main className="container legal-page-body">
        <section className="legal-warning">
          <strong>{t('legalPage.noticeTitle')}</strong>
          <p>
            {t('legalPage.notice')}
          </p>
        </section>

        <section className="legal-summary-grid">
          <article>
            <span>For buyers</span>
            <h2>Check title before money moves</h2>
            <p>Confirm ownership, restrictions, encumbrances, access, planning approvals, and seller authority before paying a deposit.</p>
          </article>
          <article>
            <span>For sellers</span>
            <h2>Prepare documents before listing</h2>
            <p>Clean documents, honest disclosures, and site-visit permission make admin approval and buyer confidence much faster.</p>
          </article>
          <article>
            <span>For foreign buyers</span>
            <h2>Confirm eligibility first</h2>
            <p>Foreign land ownership is restricted. Check the legal structure and banking path before entering an agreement.</p>
          </article>
        </section>

        <section className="legal-page-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('legalPage.mainLaws')}</h2>
              <p className="section-subtitle">{t('legalPage.mainLawsSub')}</p>
            </div>
          </div>
          <div className="legal-law-grid">
            {lawGroups.map(group => (
              <article className="legal-law-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="legal-law-list">
                  {group.items.map(item => (
                    <div className="legal-law-item" key={item.law}>
                      <strong>{item.law}</strong>
                      <p>{item.note}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="legal-checks">
          <div className="legal-check-panel">
            <span className="legal-page-kicker">{t('legalPage.buyerChecklist')}</span>
            <h2>{t('legalPage.beforeBuying')}</h2>
            <ul>
              {buyerChecks.map(check => <li key={check}>{check}</li>)}
            </ul>
          </div>
          <div className="legal-check-panel">
            <span className="legal-page-kicker">{t('legalPage.sellerChecklist')}</span>
            <h2>{t('legalPage.beforeSelling')}</h2>
            <ul>
              {sellerChecks.map(check => <li key={check}>{check}</li>)}
            </ul>
          </div>
        </section>

        {user && userAppointments.length > 0 && (
          <div className="legal-user-appointments-panel">
            <div className="legal-user-appointments-header">
              <span className="legal-page-kicker">My Booked Legal Sessions</span>
              <h3>My Legal Consultations</h3>
              <p>View your scheduled legal consultations (Online Video Meeting or In-Person Law Chambers Visit) and access your secure meeting room or office directions.</p>
            </div>
            <div className="legal-user-appointments-list">
              {userAppointments.map(appt => (
                <div key={appt.id} className={`legal-user-appointment-card ${appt.status === 'confirmed' ? 'legal-user-appointment-card--confirmed' : ''}`}>
                  <div className="legal-user-appointment-info">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="legal-user-appointment-badge">
                        {appt.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: appt.consultation_type === 'office' ? '#ecfdf5' : '#eff6ff', color: appt.consultation_type === 'office' ? '#065f46' : '#1e40af', fontWeight: '700' }}>
                        {appt.consultation_type === 'office' ? '🏢 In-Person Office Visit' : '📹 Online Video Call'}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: appt.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: appt.payment_status === 'paid' ? '#15803d' : '#b45309', fontWeight: '700' }}>
                        {appt.payment_status === 'paid' ? `✓ Fee Paid (Rs. ${Number(appt.fee_amount || 5000).toLocaleString()})` : '⏳ Bank Slip Pending Clearance'}
                      </span>
                    </div>

                    <h4>{appt.topic}</h4>
                    <p style={{ margin: '4px 0', fontSize: '0.88rem' }}>
                      Lawyer: <strong>{appt.lawyer?.name || 'KNW Real Estate Legal Counsel'}</strong>
                    </p>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#475569', margin: '4px 0' }}>
                      📅 {appt.appointment_date} at {appt.start_time?.slice(0, 5)}
                    </span>

                    {appt.consultation_type === 'office' && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#047857', background: '#f0fdf4', padding: '6px 10px', borderRadius: '5px' }}>
                        📍 <strong>Law Chambers Address:</strong> {appt.office_location || appt.lawyer?.lawyer_profile?.office_location || 'Attorney Chambers, Colombo 03'}
                      </p>
                    )}

                    {appt.lawyer_note && (
                      <p className="legal-user-appointment-note" style={{ marginTop: '6px' }}>
                        Attorney Note: "{appt.lawyer_note}"
                      </p>
                    )}
                  </div>

                  <div className="legal-user-appointment-action">
                    {appt.consultation_type === 'video' ? (
                      appt.status === 'confirmed' && appt.video_meeting_url ? (
                        <a
                          href={appt.video_meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="legal-join-video-btn"
                        >
                          📹 Join Video Consultation
                        </a>
                      ) : (
                        <span className="legal-pending-pill">
                          {appt.payment_status === 'pending_verification' ? '⏳ Bank slip verifying' : '⏳ Awaiting lawyer confirmation'}
                        </span>
                      )
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#047857', display: 'block', marginBottom: '4px' }}>
                          🏢 Confirmed for Office Visit
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Please arrive 10 mins before slot
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="legal-guest-video-banner">
            <div>
              <span className="legal-page-kicker">Encrypted Video Consultations</span>
              <h3>Book 1-on-1 Consultations with Certified Land Lawyers</h3>
              <p>Sign in to unlock direct browser-based video meeting rooms, deed review appointments, and title clearance sessions.</p>
            </div>
            <button className="btn-primary" onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}>
              Sign In / Register to Consult
            </button>
          </div>
        )}

        <section className="legal-page-section legal-booking-panel">
          <div className="legal-booking-copy">
            <span className="legal-page-kicker">Book legal advice</span>
            <h2>Request an appointment with a property lawyer</h2>
            <p>
              Choose a lawyer, add your preferred date and time, and send the request. The lawyer can confirm,
              reject, or suggest a new day and time from the lawyer dashboard.
            </p>
            {selectedLawyer && (
              <div className="legal-lawyer-card">
                <strong>{selectedLawyer.name}</strong>
                <span>{selectedLawyer.lawyer_profile?.specialization || 'Land and property law'}</span>
                <p>{selectedLawyer.lawyer_profile?.bio || 'Available for land, title, transfer, and property transaction advice.'}</p>
                <div className="legal-schedule-tags">
                  {selectedSchedule.length === 0 && <span>No weekly schedule added yet</span>}
                  {selectedSchedule.map(item => (
                    <span key={item.id}>{weekdays[item.weekday]} {item.start_time.slice(0, 5)}-{item.end_time.slice(0, 5)}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="legal-booking-form" onSubmit={bookAppointment}>
            {(bookingMessage || bookingError) && (
              <div className={`legal-booking-alert ${bookingError ? 'legal-booking-alert--error' : ''}`}>
                {bookingError || bookingMessage}
              </div>
            )}
            <label>
              Lawyer
              <select
                value={appointment.lawyer_id}
                onChange={e => {
                  setAvailableSlots([])
                  setAppointment({ ...appointment, lawyer_id: e.target.value, start_time: '' })
                }}
                required
              >
                {lawyers.length === 0 && <option value="">No lawyers available</option>}
                {lawyers.map(lawyer => (
                  <option value={lawyer.id} key={lawyer.id}>{lawyer.name}</option>
                ))}
              </select>
            </label>
            <div className="legal-booking-row">
              <label>
                Date
                <input
                  type="date"
                  min={today}
                  value={appointment.appointment_date}
                  onChange={e => {
                    setAvailableSlots([])
                    setAppointment({ ...appointment, appointment_date: e.target.value, start_time: '' })
                  }}
                  required
                />
              </label>
            </div>
            <div className="legal-slot-picker">
              <span>Available times</span>
              {!appointment.appointment_date && <p>Choose a date to see open consultation times.</p>}
              {appointment.appointment_date && slotsLoading && <p>Loading available times...</p>}
              {appointment.appointment_date && !slotsLoading && availableSlots.length === 0 && <p>No open slots on this date. Try another day.</p>}
              {availableSlots.length > 0 && (
                <div className="legal-slot-grid">
                  {availableSlots.map(slot => (
                    <button
                      className={appointment.start_time === slot.start_time ? 'legal-slot legal-slot--selected' : 'legal-slot'}
                      key={`${slot.start_time}-${slot.end_time}`}
                      type="button"
                      onClick={() => setAppointment({ ...appointment, start_time: slot.start_time })}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label>
              Name
              <input value={appointment.customer_name} onChange={e => setAppointment({ ...appointment, customer_name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={appointment.customer_email} onChange={e => setAppointment({ ...appointment, customer_email: e.target.value })} required />
            </label>
            <label>
              Phone
              <input value={appointment.customer_phone} onChange={e => setAppointment({ ...appointment, customer_phone: e.target.value })} />
            </label>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                I am booking as
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: appointment.user_role === 'buyer' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: appointment.user_role === 'buyer' ? '#ecfdf5' : '#fff',
                    color: appointment.user_role === 'buyer' ? '#065f46' : '#475569',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAppointment({ ...appointment, user_role: 'buyer' })}
                >
                  🏡 Buyer / Investor
                </button>
                <button
                  type="button"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: appointment.user_role === 'seller' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: appointment.user_role === 'seller' ? '#ecfdf5' : '#fff',
                    color: appointment.user_role === 'seller' ? '#065f46' : '#475569',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAppointment({ ...appointment, user_role: 'seller' })}
                >
                  🏢 Property Seller / Owner
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                Consultation Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    border: appointment.consultation_type === 'video' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: appointment.consultation_type === 'video' ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAppointment({ ...appointment, consultation_type: 'video' })}
                >
                  <strong style={{ display: 'block', color: '#1e3a8a', fontSize: '0.9rem' }}>📹 Online Video Call</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Direct encrypted browser room</span>
                </button>
                <button
                  type="button"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    border: appointment.consultation_type === 'office' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: appointment.consultation_type === 'office' ? '#ecfdf5' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAppointment({ ...appointment, consultation_type: 'office' })}
                >
                  <strong style={{ display: 'block', color: '#065f46', fontSize: '0.9rem' }}>🏢 In-Person Office Visit</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Meet at lawyer's chambers</span>
                </button>
              </div>
              {appointment.consultation_type === 'office' && (
                <div style={{ marginTop: '8px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', color: '#334155' }}>
                  📍 <strong>Chambers Address:</strong> {selectedLawyer?.lawyer_profile?.office_location || 'Attorney Chambers, Colombo 03, Sri Lanka'}
                </div>
              )}
            </div>

            <label>
              Topic
              <input value={appointment.topic} onChange={e => setAppointment({ ...appointment, topic: e.target.value })} placeholder="e.g. Title deed verification, seller sales agreement, partition law..." required />
            </label>

            <label>
              Message / Specific Questions
              <textarea rows={3} value={appointment.message} onChange={e => setAppointment({ ...appointment, message: e.target.value })} placeholder="Briefly explain your property legal questions or document status" />
            </label>

            {/* Fee summary banner */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px 18px', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#166534', fontSize: '0.92rem' }}>Legal Consultation Fee</span>
                <strong style={{ fontSize: '1.25rem', color: '#15803d' }}>
                  Rs. {Number(selectedLawyer?.lawyer_profile?.consultation_fee || 5000).toLocaleString()} LKR
                </strong>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#166534' }}>
                Includes 30-min consultation session ({appointment.consultation_type === 'office' ? 'at law office' : 'via secure video meeting'}), deed inspection & legal compliance advisory.
              </p>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: appointment.payment_method === 'online' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: appointment.payment_method === 'online' ? '#ecfdf5' : '#fff',
                    color: appointment.payment_method === 'online' ? '#065f46' : '#475569',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAppointment({ ...appointment, payment_method: 'online' })}
                >
                  💳 Online Transaction (Card / PayHere)
                </button>
                <button
                  type="button"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: appointment.payment_method === 'bank_transfer' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: appointment.payment_method === 'bank_transfer' ? '#ecfdf5' : '#fff',
                    color: appointment.payment_method === 'bank_transfer' ? '#065f46' : '#475569',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAppointment({ ...appointment, payment_method: 'bank_transfer' })}
                >
                  🏦 Upload Bank Deposit Slip
                </button>
              </div>

              {appointment.payment_method === 'bank_transfer' && (
                <div style={{ marginTop: '12px', padding: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                    🏢 Bank Transfer Details:
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                    <div><strong>Bank:</strong> Commercial Bank of Ceylon PLC</div>
                    <div><strong>Account Name:</strong> KNW PRO REALTOR (PVT) LTD</div>
                    <div><strong>Account Number:</strong> 8004928172</div>
                    <div><strong>Branch:</strong> Colombo 03 Corporate Branch</div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Deposit Slip Reference / Transaction ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-892140 or Cash Deposit Ref"
                      value={appointment.payment_reference}
                      onChange={e => setAppointment({ ...appointment, payment_reference: e.target.value })}
                      required={appointment.payment_method === 'bank_transfer'}
                    />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Upload Bank Transfer Slip (Image or PDF)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => setBankSlipFile(e.target.files[0] || null)}
                      required={appointment.payment_method === 'bank_transfer'}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={lawyers.length === 0 || !appointment.start_time || submittingBooking}
              style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '700' }}
            >
              {submittingBooking
                ? 'Processing Booking...'
                : (appointment.payment_method === 'bank_transfer'
                    ? 'Upload Slip & Request Consultation'
                    : `Pay Rs. ${Number(selectedLawyer?.lawyer_profile?.consultation_fee || 5000).toLocaleString()} & Confirm Slot`
                  )
              }
            </button>
          </form>
        </section>

        <section className="legal-page-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('legalPage.transactionFlow')}</h2>
              <p className="section-subtitle">{t('legalPage.transactionSub')}</p>
            </div>
          </div>
          <div className="legal-timeline">
            {timeline.map(([step, title, text]) => (
              <div className="legal-timeline-item" key={step}>
                <span>{step}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="legal-page-section legal-source-panel">
          <div>
            <span className="legal-page-kicker">{t('legalPage.sources')}</span>
            <h2>{t('legalPage.sourcesTitle')}</h2>
            <p>{t('legalPage.sourcesText')}</p>
          </div>
          <div className="legal-source-list">
            {sources.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noreferrer">{label}</a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}
