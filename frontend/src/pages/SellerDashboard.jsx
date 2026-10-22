import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import SellerInvoiceModal from '../components/SellerInvoiceModal'
import ReportViewerModal from '../components/ReportViewerModal'
import { downloadCalendarInvite } from '../utils/calendarInvite'
import './Marketplace.css'

export default function SellerDashboard({ onNavigate }) {
  const { user, switchRole } = useAuth()
  const [listings, setListings] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [payments, setPayments] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [activeReportModal, setActiveReportModal] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [uploadingDocListing, setUploadingDocListing] = useState(null)
  const [docFiles, setDocFiles] = useState({ deed: null, survey: null, council: null, other: null })
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  async function handleUploadDocs(e) {
    e.preventDefault()
    if (!uploadingDocListing) return
    setUploadLoading(true)
    setMessage('')
    setError('')
    try {
      const payload = new FormData()
      if (docFiles.deed) payload.append('deed_document', docFiles.deed)
      if (docFiles.survey) payload.append('survey_plan', docFiles.survey)
      if (docFiles.council) payload.append('council_document', docFiles.council)
      if (docFiles.other) payload.append('other_document', docFiles.other)

      const res = await axios.post(`/api/seller/listings/${uploadingDocListing.id}/documents`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage(res.data.message || 'Legal documents uploaded successfully.')
      setUploadingDocListing(null)
      setDocFiles({ deed: null, survey: null, council: null, other: null })
      await loadDashboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload legal documents.')
    } finally {
      setUploadLoading(false)
    }
  }

  if (!user || user.role !== 'seller') {
    return (
      <main className="container marketplace-loading">
        <h1>Seller access only</h1>
        <p>Sign in with a seller account to view listing status and buyer inquiries.</p>
        <button className="btn-primary" onClick={() => onNavigate('login')}>Sign in</button>
      </main>
    )
  }

  async function loadDashboard() {
    setError('')
    try {
      const query = user.id ? `seller_id=${user.id}` : `seller_email=${encodeURIComponent(user.email)}`
      const paymentsQuery = user.id ? `user_id=${user.id}` : `email=${encodeURIComponent(user.email)}`
      const [listingsRes, inquiriesRes, paymentsRes, appointmentsRes] = await Promise.all([
        axios.get(`/api/seller/listings?${query}`),
        axios.get(`/api/seller/inquiries?${query}`),
        axios.get(`/api/seller/payments?${paymentsQuery}`),
        axios.get(`/api/user/appointments?${paymentsQuery}`).catch(() => ({ data: { data: [] } })),
      ])
      setListings(listingsRes.data.data || [])
      setInquiries(inquiriesRes.data.data || [])
      setPayments(paymentsRes.data.data || [])
      setAppointments(appointmentsRes.data.data || [])
    } catch {
      setError('Could not load seller dashboard right now.')
    }
  }

  async function updateInquiry(id, status) {
    setMessage('')
    setError('')
    try {
      const res = await axios.patch(`/api/seller/inquiries/${id}`, { status })
      setMessage(res.data.message || 'Inquiry updated.')
      await loadDashboard()
    } catch {
      setError('Could not update inquiry.')
    }
  }

  async function updateVisitStatus(id, visitStatus, sellerNote = null) {
    setMessage('')
    setError('')
    try {
      const res = await axios.patch(`/api/site-visits/${id}`, {
        visit_status: visitStatus,
        seller_note: sellerNote,
      })
      setMessage(res.data.message || 'Site inspection status updated.')
      await loadDashboard()
    } catch {
      setError('Could not update inspection status.')
    }
  }

  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  function exportInquiriesCSV() {
    const headers = ['Inquiry ID', 'Buyer Name', 'Email', 'Phone', 'Property Type', 'District', 'Status', 'Date', 'Message']
    const rows = inquiries.map(i => [
      i.id,
      `"${i.buyer_name || ''}"`,
      `"${i.buyer_email || ''}"`,
      `"${i.buyer_phone || ''}"`,
      `"${i.property?.property_type || ''}"`,
      `"${i.property?.district || ''}"`,
      `"${i.status || ''}"`,
      `"${i.created_at || ''}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadCSV(csv, `knw_seller_leads_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function exportListingsCSV() {
    const headers = ['Listing ID', 'Property Type', 'District', 'Expected Price', 'Status', 'Payment Status', 'Inquiries Count', 'Created At']
    const rows = listings.map(l => [
      l.id,
      `"${l.property_type || ''}"`,
      `"${l.district || ''}"`,
      `"${l.expected_price || ''}"`,
      `"${l.status || ''}"`,
      `"${l.payment_status || ''}"`,
      l.inquiries_count || 0,
      `"${l.created_at || ''}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadCSV(csv, `knw_my_listings_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function renderActiveReportModal() {
    if (!activeReportModal) return null

    const type = activeReportModal.type

    if (type === 'seller_listings') {
      return (
        <ReportViewerModal
          title="Seller Property Portfolio & Listing Status Report"
          subtitle={`Official property portfolio audit report for registered seller ${user.name} (${user.email}).`}
          reportCode={`KNW-SELLER-PROP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={listings}
          columns={[
            { key: 'id', label: 'Listing ID', width: '80px' },
            { key: 'property_type', label: 'Property Type' },
            { key: 'district', label: 'District' },
            {
              key: 'expected_price',
              label: 'Expected Price',
              render: val => <strong>{val}</strong>,
            },
            {
              key: 'status',
              label: 'Listing Status',
              render: val => (
                <span
                  className={`report-badge ${
                    val === 'published'
                      ? 'report-badge--green'
                      : val === 'rejected'
                      ? 'report-badge--red'
                      : 'report-badge--yellow'
                  }`}
                >
                  {val}
                </span>
              ),
            },
            {
              key: 'payment_status',
              label: 'Listing Fee',
              render: val => (
                <span className={`report-badge ${val === 'paid' ? 'report-badge--green' : 'report-badge--yellow'}`}>
                  {val}
                </span>
              ),
            },
            {
              key: 'inquiries_count',
              label: 'Buyer Leads',
              align: 'center',
              render: val => <strong>{val || 0}</strong>,
            },
            {
              key: 'created_at',
              label: 'Date Listed',
              render: val => new Date(val || Date.now()).toLocaleDateString('en-GB'),
            },
          ]}
          kpis={[
            { label: 'Total Listings', value: listings.length, icon: '🏡', sub: 'Portfolio items' },
            { label: 'Published & Live', value: listings.filter(l => l.status === 'published').length, icon: '✓', sub: 'Visible to buyers' },
            { label: 'Pending Verification', value: listings.filter(l => l.status === 'pending_review').length, icon: '⏳', sub: 'In review' },
            { label: 'Total Inquiries', value: listings.reduce((s, l) => s + (l.inquiries_count || 0), 0), icon: '📈', sub: 'Total buyer leads' },
          ]}
          csvFilename={`knw_my_listings_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportListingsCSV}
          onClose={() => setActiveReportModal(null)}
          initialPrint={activeReportModal.initialPrint}
        />
      )
    }

    if (type === 'seller_leads') {
      const generalInquiries = inquiries.filter(i => !i.is_site_visit)
      return (
        <ReportViewerModal
          title="Seller Inbound Buyer Leads & Inquiries Report"
          subtitle={`Official prospective buyer inquiry log for listings published by ${user.name}.`}
          reportCode={`KNW-SELLER-LEADS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={generalInquiries}
          columns={[
            { key: 'id', label: 'Ref #', width: '60px' },
            {
              key: 'buyer_name',
              label: 'Buyer Name & Contact',
              render: (val, row) => (
                <div>
                  <strong>{val}</strong>
                  <br />
                  <small style={{ color: '#64748b' }}>{row.buyer_email || row.buyer_phone}</small>
                </div>
              ),
            },
            { key: 'buyer_phone', label: 'Phone' },
            {
              key: 'property',
              label: 'Inquired Property',
              render: (val, row) => (
                <strong>
                  {row.property?.property_type} in {row.property?.district}
                </strong>
              ),
            },
            {
              key: 'status',
              label: 'Lead Status',
              render: val => (
                <span
                  className={`report-badge ${
                    val === 'closed'
                      ? 'report-badge--green'
                      : val === 'contacted'
                      ? 'report-badge--blue'
                      : 'report-badge--yellow'
                  }`}
                >
                  {val}
                </span>
              ),
            },
            {
              key: 'created_at',
              label: 'Date',
              render: val => new Date(val || Date.now()).toLocaleDateString('en-GB'),
            },
            {
              key: 'message',
              label: 'Buyer Inquiry Message',
              render: val => (
                <span style={{ fontSize: '0.74rem', color: '#475569' }}>
                  {val ? (val.length > 60 ? val.slice(0, 60) + '...' : val) : '-'}
                </span>
              ),
            },
          ]}
          kpis={[
            { label: 'Total Inquiries', value: generalInquiries.length, icon: '📨', sub: 'Inbound messages' },
            { label: 'Contacted Leads', value: generalInquiries.filter(i => i.status === 'contacted').length, icon: '💬', sub: 'In dialogue' },
            { label: 'Closed Deals', value: generalInquiries.filter(i => i.status === 'closed').length, icon: '✓', sub: 'Resolved' },
            { label: 'Pending Response', value: generalInquiries.filter(i => i.status === 'new').length, icon: '⏳', sub: 'Awaiting reply' },
          ]}
          csvFilename={`knw_seller_leads_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportInquiriesCSV}
          onClose={() => setActiveReportModal(null)}
          initialPrint={activeReportModal.initialPrint}
        />
      )
    }

    return null
  }

  return (
    <div className="page marketplace-page">
      <div className="page-hero marketplace-hero">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span>/</span>
            <span>Seller dashboard</span>
          </div>
          <h1 className="page-hero__title">Seller dashboard</h1>
          <p className="page-hero__sub">Track listing approvals, payment review, published status, and buyer inquiries.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              🏷️ Mode: Authorized Seller
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '6px 14px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '20px', cursor: 'pointer' }}
                onClick={() => { switchRole('buyer'); onNavigate('buyerDashboard') }}
              >
                🛒 Switch to Buyer Mode ➔
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}
                onClick={() => onNavigate('sell')}
              >
                ➕ Create Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container seller-dashboard-body">
        {/* Verification Status Banner */}
        {(() => {
          const isApproved = user?.can?.list_property || user?.seller_status === 'active' || (user?.role === 'seller' && user?.status === 'active') || ['admin', 'staff'].includes(user?.role)
          const isRejected = user?.seller_status === 'rejected' || (user?.role === 'seller' && user?.status === 'rejected')
          const isPending = !isApproved && !isRejected

          return (
            <div style={{
              marginBottom: '20px',
              padding: '14px 18px',
              borderRadius: '10px',
              border: isApproved ? '1px solid #10b981' : isRejected ? '1px solid #ef4444' : '1px solid #f59e0b',
              background: isApproved ? '#ecfdf5' : isRejected ? '#fef2f2' : '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {isApproved ? '🛡️' : isRejected ? '❌' : '⏳'}
                  </span>
                  <strong style={{
                    color: isApproved ? '#065f46' : isRejected ? '#991b1b' : '#92400e',
                    fontSize: '0.95rem'
                  }}>
                    {isApproved
                      ? 'Seller Identity & Documents: Verified & Approved'
                      : isRejected
                      ? 'Seller Application: Rejected by Admin'
                      : 'Seller Identity Verification: Pending Admin Approval'}
                  </strong>
                </div>
                <p style={{
                  margin: '4px 0 0 28px',
                  fontSize: '0.82rem',
                  color: isApproved ? '#047857' : isRejected ? '#b91c1c' : '#b45309'
                }}>
                  {isApproved
                    ? `Account verified for property selling on KNW PRO Realtor. Your listings are eligible for deed verification and marketplace publishing.`
                    : isRejected
                    ? `Rejection note: ${user.rejection_reason || 'Document verification could not be completed'}. You may re-submit verification from the Sell page.`
                    : 'Your uploaded NIC / passport details are currently in the Admin review queue. Properties you submit will be published once your seller identity is approved.'}
                </p>
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '999px',
                background: isApproved ? '#d1fae5' : isRejected ? '#fee2e2' : '#fef3c7',
                color: isApproved ? '#065f46' : isRejected ? '#991b1b' : '#92400e'
              }}>
                Status: {isApproved ? 'active' : isRejected ? 'rejected' : 'pending'}
              </span>
            </div>
          )
        })()}

        {(message || error) && (
          <div className={`marketplace-alert ${error ? 'marketplace-alert--error' : ''}`}>{error || message}</div>
        )}

        <section className="seller-dash-stats">
          <article><span>Total listings</span><strong>{listings.length}</strong></article>
          <article><span>Published</span><strong>{listings.filter(item => item.status === 'published').length}</strong></article>
          <article><span>Pending review</span><strong>{listings.filter(item => item.status === 'pending_review').length}</strong></article>
          <article><span>Site Inspections</span><strong>{inquiries.filter(i => i.is_site_visit).length}</strong></article>
          <article><span>Buyer inquiries</span><strong>{inquiries.filter(i => !i.is_site_visit).length}</strong></article>
          <article><span>Payments</span><strong>{payments.length}</strong></article>
        </section>

        <section className="marketplace-panel">
          <div className="marketplace-panel__head">
            <h2>Payment records</h2>
          </div>
          <div className="seller-table">
            {payments.length === 0 && <p>No payment records yet.</p>}
            {payments.map(payment => (
              <article key={payment.id}>
                <div>
                  <strong>{payment.order_id}</strong>
                  <span>{payment.provider} - {payment.plan || 'listing'} - {payment.status}</span>
                  {payment.property && <p>{payment.property.property_type} in {payment.property.district}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`marketplace-status marketplace-status-${payment.status}`}>{payment.currency} {Number(payment.amount).toLocaleString()}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'Pending'}</span>
                  <button
                    type="button"
                    style={{
                      marginTop: '4px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => setSelectedReceipt(payment)}
                  >
                    🧾 View Tax Invoice
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="marketplace-panel">
          <div className="marketplace-panel__head">
            <h2>My listings</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveReportModal({ type: 'seller_listings', initialPrint: false })}
                disabled={listings.length === 0}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                title="View portfolio audit report on screen or print as PDF"
              >
                👁️ View Report / PDF
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={exportListingsCSV}
                disabled={listings.length === 0}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                📊 CSV
              </button>
              <button className="btn-primary" onClick={() => onNavigate('sell')}>Add listing</button>
            </div>
          </div>
          <div className="seller-table">
            {listings.length === 0 && <p>No seller listings yet.</p>}
            {listings.map(listing => (
              <article key={listing.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{listing.property_type} in {listing.district}</strong>
                    <div style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      {listing.expected_price} • Plan: {listing.listing_plan || 'basic'} • Status: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{listing.status}</span>
                    </div>
                    {listing.rejection_reason && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>Rejection: {listing.rejection_reason}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`marketplace-status marketplace-status-${listing.payment_status}`}>{listing.payment_status}</span>
                    <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569' }}>{listing.inquiries_count || 0} inquiries</span>
                  </div>
                </div>

                {/* Legal Title & Deed Verification Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>
                      {listing.is_deed_verified ? '🛡️' : listing.legal_status === 'submitted_for_review' ? '⏳' : listing.legal_status === 'rejected' ? '⚠️' : '📄'}
                    </span>
                    <div>
                      <strong style={{ fontSize: '13px', color: listing.is_deed_verified ? '#15803d' : listing.legal_status === 'submitted_for_review' ? '#b45309' : listing.legal_status === 'rejected' ? '#b91c1c' : '#475569' }}>
                        {listing.is_deed_verified
                          ? 'KNW Certified Deed & Title Verified'
                          : listing.legal_status === 'submitted_for_review'
                          ? 'Documents Submitted (Awaiting Lawyer Review)'
                          : listing.legal_status === 'rejected'
                          ? 'Document Clarification Required'
                          : 'No Legal Documents Uploaded'}
                      </strong>
                      {listing.is_deed_verified && (
                        <small style={{ display: 'block', color: '#166534', fontSize: '11px' }}>
                          Verified by Attorney {listing.verifier_name || 'Panel Attorney'} {listing.deed_verified_at ? `on ${new Date(listing.deed_verified_at).toLocaleDateString()}` : ''}
                        </small>
                      )}
                      {listing.legal_status === 'rejected' && listing.legal_review_note && (
                        <small style={{ display: 'block', color: '#b91c1c', fontSize: '11px' }}>
                          Note: {listing.legal_review_note}
                        </small>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => {
                        setUploadingDocListing(listing)
                        setDocFiles({ deed: null, survey: null, council: null, other: null })
                      }}
                    >
                      📎 {listing.deed_document_url || listing.survey_plan_url ? 'Manage Deeds & Documents' : 'Upload Deeds for Lawyer Check'}
                    </button>
                    {listing.status === 'published' && (
                      <button
                        type="button"
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', background: '#fff', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                        onClick={() => onNavigate('propertyDetail', { id: listing.id })}
                      >
                        View Public Page
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Physical On-Site Inspection Requests */}
        <section className="marketplace-panel">
          <div className="marketplace-panel__head">
            <h2>📅 On-Site Inspection Requests ({inquiries.filter(i => i.is_site_visit).length})</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Physical property visit appointments requested by verified buyers.
            </p>
          </div>
          <div className="seller-table">
            {inquiries.filter(i => i.is_site_visit).length === 0 && (
              <p>No physical inspection requests yet.</p>
            )}
            {inquiries.filter(i => i.is_site_visit).map(item => (
              <article key={item.id} style={{ borderLeft: item.visit_status === 'confirmed' ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                <div>
                  <strong>{item.buyer_name}</strong>
                  <span>{item.buyer_email} {item.buyer_phone ? `- ${item.buyer_phone}` : ''}</span>
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#0f172a' }}>
                    <strong>Requested Date: </strong>{item.visit_date ? new Date(item.visit_date).toLocaleDateString() : 'Pending'} ({item.visit_slot})
                  </div>
                  {item.message && <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#475569' }}>"{item.message}"</p>}
                  <em>Target: {item.property?.property_type} in {item.property?.district}</em>
                </div>
                <div className="seller-inquiry-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`marketplace-status marketplace-status-${item.visit_status || 'pending'}`}>
                    {item.visit_status === 'confirmed' ? '✓ Confirmed' : (item.visit_status || 'Pending')}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {item.visit_status !== 'confirmed' && (
                      <button
                        type="button"
                        style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                        onClick={() => updateVisitStatus(item.id, 'confirmed')}
                      >
                        ✓ Confirm Visit
                      </button>
                    )}
                    {item.visit_status !== 'completed' && (
                      <button
                        type="button"
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                        onClick={() => updateVisitStatus(item.id, 'completed')}
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      type="button"
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 8px', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer' }}
                      onClick={() => downloadCalendarInvite({
                        title: `Inspection: ${item.property?.property_type} in ${item.property?.district}`,
                        description: `Physical site visit with buyer ${item.buyer_name}.\nPhone: ${item.buyer_phone}\nEmail: ${item.buyer_email}\nNotes: ${item.message}`,
                        location: `${item.property?.district || 'Sri Lanka'}`,
                        startDate: item.visit_date,
                        timeSlot: item.visit_slot,
                        contactName: item.buyer_name,
                        contactPhone: item.buyer_phone,
                      })}
                      title="Download calendar invite"
                    >
                      📅 .ICS
                    </button>
                    {item.buyer_phone && (
                      <a
                        href={`https://wa.me/${String(item.buyer_phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${item.buyer_name}, regarding your physical site inspection for Property #${item.seller_property_draft_id} on ${item.visit_date} (${item.visit_slot})...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#25D366', color: '#fff', textDecoration: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700' }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="marketplace-panel">
          <div className="marketplace-panel__head">
            <div>
              <h2>Legal Consultations ({appointments.length})</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Consultations booked with property lawyers for deed clearance, title verification, or sales agreements.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate ? onNavigate('legal') : (window.location.href = '/legal')}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              ⚖️ Book Legal Advice
            </button>
          </div>
          <div className="seller-table">
            {appointments.length === 0 ? (
              <p style={{ padding: '16px' }}>No lawyer consultations booked yet. Need help verifying deeds or drafting sales contracts? Book an attorney above.</p>
            ) : (
              appointments.map(appt => (
                <article key={appt.id}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: appt.consultation_type === 'office' ? '#ecfdf5' : '#eff6ff', color: appt.consultation_type === 'office' ? '#065f46' : '#1e40af', fontWeight: '700' }}>
                        {appt.consultation_type === 'office' ? '🏢 In-Person Office Visit' : '📹 Online Video Call'}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: appt.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: appt.payment_status === 'paid' ? '#15803d' : '#b45309', fontWeight: '700' }}>
                        {appt.payment_status === 'paid' ? `✓ Paid (Rs. ${Number(appt.fee_amount || 5000).toLocaleString()})` : '⏳ Bank Slip Pending Clearance'}
                      </span>
                    </div>
                    <strong>{appt.topic}</strong>
                    <span>Attorney: {appt.lawyer?.name || 'Assigned Property Lawyer'} • 📅 {appt.appointment_date} at {appt.start_time?.slice(0, 5)}</span>
                    {appt.consultation_type === 'office' && (
                      <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#047857' }}>
                        📍 Law Chambers: {appt.office_location || appt.lawyer?.lawyer_profile?.office_location || 'Attorney Chambers, Colombo 03'}
                      </p>
                    )}
                    {appt.lawyer_note && <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#059669' }}>Note: "{appt.lawyer_note}"</p>}
                  </div>
                  <div className="seller-inquiry-actions">
                    <span className={`marketplace-status marketplace-status-${appt.status}`}>{appt.status}</span>
                    {appt.consultation_type === 'video' && appt.status === 'confirmed' && appt.video_meeting_url && (
                      <a
                        href={appt.video_meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '5px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700' }}
                      >
                        📹 Join Video Room
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="marketplace-panel">
          <div className="marketplace-panel__head">
            <h2>Buyer inquiries ({inquiries.filter(i => !i.is_site_visit).length})</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveReportModal({ type: 'seller_leads', initialPrint: false })}
                disabled={inquiries.filter(i => !i.is_site_visit).length === 0}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                title="View buyer leads audit report on screen or print as PDF"
              >
                👁️ View Report / PDF
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={exportInquiriesCSV}
                disabled={inquiries.filter(i => !i.is_site_visit).length === 0}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                📊 CSV
              </button>
            </div>
          </div>
          <div className="seller-table">
            {inquiries.filter(i => !i.is_site_visit).length === 0 && <p>No general inquiries yet.</p>}
            {inquiries.filter(i => !i.is_site_visit).map(item => (
              <article key={item.id}>
                <div>
                  <strong>{item.buyer_name}</strong>
                  <span>{item.buyer_email} {item.buyer_phone ? `- ${item.buyer_phone}` : ''}</span>
                  <p>{item.message || 'No message added.'}</p>
                  <em>{item.property?.property_type} in {item.property?.district}</em>
                </div>
                <div className="seller-inquiry-actions">
                  <span className={`marketplace-status marketplace-status-${item.status}`}>{item.status}</span>
                  <button onClick={() => updateInquiry(item.id, 'contacted')}>Mark contacted</button>
                  <button onClick={() => updateInquiry(item.id, 'closed')}>Close</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {selectedReceipt && (
        <SellerInvoiceModal
          payment={selectedReceipt}
          user={user}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {uploadingDocListing && (
        <div className="marketplace-modal-backdrop" onClick={() => setUploadingDocListing(null)}>
          <div className="marketplace-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', width: '100%', padding: '28px', background: '#fff', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb' }}>
                  Lawyer Document Inspection
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '2px 0 0 0' }}>
                  Upload Legal Deeds & Certificates
                </h3>
                <small style={{ color: '#64748b' }}>
                  Property: {uploadingDocListing.property_type} in {uploadingDocListing.district} (Listing #{uploadingDocListing.id})
                </small>
              </div>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setUploadingDocListing(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>
                  {uploadingDocListing.is_deed_verified ? '🛡️' : uploadingDocListing.legal_status === 'submitted_for_review' ? '⏳' : '📄'}
                </span>
                <strong style={{ fontSize: '13px', color: uploadingDocListing.is_deed_verified ? '#15803d' : '#475569' }}>
                  Current Status: {uploadingDocListing.is_deed_verified ? 'Verified Clear by Lawyer' : uploadingDocListing.legal_status === 'submitted_for_review' ? 'Under Lawyer Review' : 'No Verified Documents'}
                </strong>
              </div>
              {uploadingDocListing.legal_review_note && (
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#b91c1c' }}>
                  Attorney Note: {uploadingDocListing.legal_review_note}
                </p>
              )}
            </div>

            <form onSubmit={handleUploadDocs} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  📄 Title Deed / Extract Copy (PDF / Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setDocFiles(prev => ({ ...prev, deed: e.target.files?.[0] || null }))}
                  style={{ fontSize: '13px', width: '100%' }}
                />
                {uploadingDocListing.deed_document_url && (
                  <small style={{ color: '#047857', display: 'block', marginTop: '2px' }}>
                    ✓ Previously uploaded: <a href={uploadingDocListing.deed_document_url} target="_blank" rel="noreferrer">View Current Deed</a>
                  </small>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  📐 Registered Survey Plan (PDF / Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setDocFiles(prev => ({ ...prev, survey: e.target.files?.[0] || null }))}
                  style={{ fontSize: '13px', width: '100%' }}
                />
                {uploadingDocListing.survey_plan_url && (
                  <small style={{ color: '#047857', display: 'block', marginTop: '2px' }}>
                    ✓ Previously uploaded: <a href={uploadingDocListing.survey_plan_url} target="_blank" rel="noreferrer">View Current Survey Plan</a>
                  </small>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  🏛️ Local Council Clearance (Street line / Non-vesting)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setDocFiles(prev => ({ ...prev, council: e.target.files?.[0] || null }))}
                  style={{ fontSize: '13px', width: '100%' }}
                />
                {uploadingDocListing.council_document_url && (
                  <small style={{ color: '#047857', display: 'block', marginTop: '2px' }}>
                    ✓ Previously uploaded: <a href={uploadingDocListing.council_document_url} target="_blank" rel="noreferrer">View Current Clearance</a>
                  </small>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  📎 Other Supporting Legal Documents (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => setDocFiles(prev => ({ ...prev, other: e.target.files?.[0] || null }))}
                  style={{ fontSize: '13px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  style={{ padding: '9px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => setUploadingDocListing(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploadLoading || (!docFiles.deed && !docFiles.survey && !docFiles.council && !docFiles.other)}
                  style={{ padding: '9px 20px' }}
                >
                  {uploadLoading ? 'Uploading...' : 'Submit to Lawyer for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renderActiveReportModal()}
    </div>
  )
}
