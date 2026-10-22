import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ReportViewerModal from '../components/ReportViewerModal'
import './AdminDashboard.css'

const emptyFilters = { role: '', status: '', search: '' }
const emptyForm = { name: '', email: '', phone: '', role: 'staff' }
const emptyBlogForm = { title: '', excerpt: '', content: '', category: 'Legal Tips', tags: '' }

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingSellers, setPendingSellers] = useState([])
  const [pendingListings, setPendingListings] = useState([])
  const [publishedListings, setPublishedListings] = useState([])
  const [propertyInquiries, setPropertyInquiries] = useState([])
  const [payments, setPayments] = useState([])
  const [reviews, setReviews] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [appointments, setAppointments] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [form, setForm] = useState(emptyForm)
  const [blogForm, setBlogForm] = useState(emptyBlogForm)
  const [editingBlogId, setEditingBlogId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [activeReportModal, setActiveReportModal] = useState(null)

  const canManage = ['admin', 'staff'].includes(user?.role)
  const isAdmin = user?.role === 'admin'

  const query = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    return params.toString()
  }, [filters])

  useEffect(() => {
    if (!canManage) return
    loadDashboard()
  }, [canManage, query])

  if (!canManage) {
    return (
      <div className="admin-app">
        <main className="admin-shell admin-access" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>
            🔒
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Administrator Access Restricted</h1>
          <p style={{ maxWidth: '480px', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {user ? (
              <>
                You are currently signed in as <strong>{user.name}</strong> with a <strong>{user.role.toUpperCase()}</strong> account.
                The Admin Dashboard is strictly reserved for authorized platform operators.
              </>
            ) : (
              'Sign in with an authorized admin or staff account to access this management dashboard.'
            )}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {user?.role === 'buyer' && (
              <button
                className="admin-primary"
                style={{ background: '#10b981', borderColor: '#10b981' }}
                onClick={() => onNavigate('buyerDashboard')}
              >
                🏡 Open Buyer Dashboard
              </button>
            )}
            {user?.role === 'seller' && (
              <button
                className="admin-primary"
                style={{ background: '#10b981', borderColor: '#10b981' }}
                onClick={() => onNavigate('sellerDashboard')}
              >
                🏷️ Open Seller Dashboard
              </button>
            )}
            <button className="admin-primary" onClick={() => onNavigate('login')}>
              Sign in with Admin account
            </button>
            <button className="admin-view-site-btn" onClick={() => onNavigate('home')}>
              ← Return to Website
            </button>
          </div>
        </main>
      </div>
    )
  }

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, usersRes, sellersRes, listingsRes, blogRes, appointmentsRes] = await Promise.all([
        axios.get('/api/admin/summary'),
        axios.get(`/api/admin/users${query ? `?${query}` : ''}`),
        axios.get('/api/admin/sellers/pending'),
        axios.get('/api/admin/listings/pending'),
        axios.get('/api/admin/blog/posts'),
        axios.get('/api/admin/appointments'),
      ])
      const [publishedRes, inquiriesRes, paymentsRes, reviewsRes] = await Promise.all([
        axios.get('/api/admin/listings/published'),
        axios.get('/api/admin/property-inquiries'),
        axios.get('/api/admin/payments'),
        axios.get('/api/admin/reviews'),
      ])
      setSummary(summaryRes.data)
      setUsers(usersRes.data.data || [])
      setPendingSellers(sellersRes.data.data || [])
      setPendingListings(listingsRes.data.data || [])
      setPublishedListings(publishedRes.data.data || [])
      setPropertyInquiries(inquiriesRes.data.data || [])
      setPayments(paymentsRes.data.data || [])
      setReviews(reviewsRes.data.data || [])
      setBlogPosts(blogRes.data.data || [])
      setAppointments(appointmentsRes.data.data || [])
    } catch (err) {
      setError(getApiError(err, 'Could not load admin data.'))
    } finally {
      setLoading(false)
    }
  }

  async function createAccount(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setTempPassword('')
    try {
      const res = await axios.post('/api/admin/users', form)
      setMessage(res.data.message)
      setTempPassword(res.data.temp_password)
      setForm(emptyForm)
      await loadDashboard()
    } catch (err) {
      setError(getApiError(err, 'Could not create account.'))
    }
  }

  async function approveSeller(id) {
    await runAction(() => axios.patch(`/api/admin/sellers/${id}/approve`))
  }

  async function rejectSeller(id) {
    const reason = window.prompt('Reason for rejecting this seller')
    if (!reason) return
    await runAction(() => axios.patch(`/api/admin/sellers/${id}/reject`, { reason }))
  }

  async function suspendUser(id) {
    await runAction(() => axios.patch(`/api/admin/users/${id}/suspend`))
  }

  async function updateRole(id, role) {
    await runAction(() => axios.patch(`/api/admin/users/${id}/role`, { role }))
  }

  async function deleteUser(id) {
    if (!window.confirm('Delete this user permanently?')) return
    await runAction(() => axios.delete(`/api/admin/users/${id}`))
  }

  async function approveListing(id) {
    await runAction(() => axios.patch(`/api/admin/listings/${id}/approve`))
  }

  async function markListingPaid(id) {
    await runAction(() => axios.patch(`/api/admin/listings/${id}/mark-paid`))
  }

  async function rejectListing(id) {
    const reason = window.prompt('Reason for rejecting this listing draft')
    if (!reason) return
    await runAction(() => axios.patch(`/api/admin/listings/${id}/reject`, { reason }))
  }

  async function toggleDeedVerified(id) {
    await runAction(() => axios.patch(`/api/admin/listings/${id}/verify-deed`))
  }

  async function createBlogPost(event) {
    event.preventDefault()
    await runAction(async () => {
      const payload = {
        ...blogForm,
        author_id: user.id,
        approved_by: user.id,
        status: 'published',
        tags: blogForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      }
      const res = editingBlogId
        ? await axios.patch(`/api/admin/blog/posts/${editingBlogId}`, payload)
        : await axios.post('/api/admin/blog/posts', payload)
      setBlogForm(emptyBlogForm)
      setEditingBlogId(null)
      return res
    })
  }

  function editBlogPost(post) {
    setEditingBlogId(post.id)
    setBlogForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Legal Tips',
      tags: (post.tags || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelBlogEdit() {
    setEditingBlogId(null)
    setBlogForm(emptyBlogForm)
  }

  async function approveBlogPost(id) {
    await runAction(() => axios.patch(`/api/admin/blog/posts/${id}/approve`, { approved_by: user.id }))
  }

  async function rejectBlogPost(id) {
    const reason = window.prompt('Reason for rejecting this blog post')
    if (!reason) return
    await runAction(() => axios.patch(`/api/admin/blog/posts/${id}/reject`, { reason }))
  }

  async function deleteBlogPost(id) {
    if (!window.confirm('Delete this blog post?')) return
    await runAction(() => axios.delete(`/api/admin/blog/posts/${id}`))
  }

  async function updateAppointment(id, status) {
    await runAction(() => axios.patch(`/api/admin/appointments/${id}`, { status }))
  }

  async function approveAppointmentPayment(id) {
    await runAction(() => axios.patch(`/api/admin/appointments/${id}/approve-payment`))
  }

  async function updatePropertyInquiry(id, status) {
    await runAction(() => axios.patch(`/api/admin/property-inquiries/${id}`, { status }))
  }

  async function approveReview(id) {
    await runAction(() => axios.patch(`/api/admin/reviews/${id}/approve`, { approved_by: user.id }))
  }

  async function rejectReview(id) {
    const admin_note = window.prompt('Reason for rejecting this review')
    if (!admin_note) return
    await runAction(() => axios.patch(`/api/admin/reviews/${id}/reject`, { admin_note }))
  }

  async function deleteReview(id) {
    if (!window.confirm('Delete this review?')) return
    await runAction(() => axios.delete(`/api/admin/reviews/${id}`))
  }

  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function exportFinancialReport() {
    const headers = ['Order ID', 'Payer Name', 'Payer Email', 'Payer Phone', 'Plan', 'Amount', 'Currency', 'Status', 'Provider', 'Reference', 'Date']
    const rows = payments.map(p => [
      `"${p.order_id || ''}"`,
      `"${p.payer_name || ''}"`,
      `"${p.payer_email || ''}"`,
      `"${p.payer_phone || ''}"`,
      `"${p.plan || ''}"`,
      p.amount || 0,
      `"${p.currency || 'LKR'}"`,
      `"${p.status || ''}"`,
      `"${p.provider || ''}"`,
      `"${p.payment_reference || ''}"`,
      `"${p.paid_at || p.created_at || ''}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadCSV(csv, `knw_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function exportInquiriesReport() {
    const headers = ['Inquiry ID', 'Buyer Name', 'Email', 'Phone', 'Property Type', 'District', 'Expected Price', 'Status', 'Date', 'Message']
    const rows = propertyInquiries.map(i => [
      i.id,
      `"${i.buyer_name || ''}"`,
      `"${i.buyer_email || ''}"`,
      `"${i.buyer_phone || ''}"`,
      `"${i.property?.property_type || ''}"`,
      `"${i.property?.district || ''}"`,
      `"${i.property?.expected_price || ''}"`,
      `"${i.status || ''}"`,
      `"${i.created_at || ''}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadCSV(csv, `knw_leads_inquiries_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function exportInventoryReport() {
    const headers = ['Property ID', 'Type', 'District', 'Price', 'Plan', 'Fee', 'Deed Verified', 'Inquiries Count', 'Published Date']
    const rows = publishedListings.map(l => [
      l.id,
      `"${l.property_type || ''}"`,
      `"${l.district || ''}"`,
      `"${l.expected_price || ''}"`,
      `"${l.listing_plan || ''}"`,
      l.listing_fee || 0,
      l.is_deed_verified ? 'Yes' : 'No',
      l.inquiries_count || 0,
      `"${l.published_at || ''}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadCSV(csv, `knw_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function exportKPISummaryCSV() {
    const headers = ['Department Category', 'Performance Indicator', 'Current Value', 'Operational Status']
    const rows = [
      ['Financial', 'Gross Recorded Platform Revenue', `Rs. ${Number(summary?.payments_total || 0).toLocaleString()}`, 'Audited'],
      ['Financial', 'Pending Payment Clearance', `Rs. ${Number(summary?.payments_pending || 0).toLocaleString()}`, 'Review Needed'],
      ['Membership', 'Total Registered Platform Users', summary?.total_users || 0, 'Active'],
      ['Membership', 'Registered Buyers & Investors', summary?.buyers || 0, 'Active'],
      ['Membership', 'Registered Sellers & Landowners', summary?.sellers || 0, 'Active'],
      ['Operations Queue', 'Pending Seller Identity Approvals', summary?.pending_sellers || 0, summary?.pending_sellers ? 'Action Required' : 'Clear'],
      ['Operations Queue', 'Pending Property Listings Review', summary?.pending_listings || 0, summary?.pending_listings ? 'Action Required' : 'Clear'],
      ['Operations Queue', 'Pending Legal Consultations', summary?.pending_appointments || 0, summary?.pending_appointments ? 'Action Required' : 'Clear'],
      ['Content Review', 'Pending Blog & Legal Submissions', summary?.pending_blog_posts || 0, 'In Review'],
      ['Content Review', 'Pending Client Reviews', summary?.pending_reviews || 0, 'In Review'],
      ['Personnel', 'Active Lawyers & Legal Advisors', summary?.lawyers || 0, 'Active'],
      ['Personnel', 'Platform Staff Operators', summary?.staff || 0, 'Active'],
      ['Compliance', 'Suspended Accounts', summary?.suspended || 0, 'Restricted'],
      ['Growth Velocity', 'New Registrations Today', summary?.new_today || 0, 'Growing'],
    ]
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    downloadCSV(csv, `knw_executive_kpi_summary_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  function openReport(type, initialPrint = false) {
    setActiveReportModal({ type, initialPrint })
  }

  function renderActiveReportModal() {
    if (!activeReportModal) return null

    const type = activeReportModal.type
    const initialPrint = activeReportModal.initialPrint

    if (type === 'financial') {
      const paidTotal = payments
        .filter(p => ['paid', 'demo_paid'].includes(p.status))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)

      return (
        <ReportViewerModal
          title="Official Financial & Revenue Audit Ledger"
          subtitle="Certified ledger of platform revenue, listing subscriptions, payment gateway settlements, and transaction verification status."
          reportCode={`KNW-REP-FIN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={payments}
          columns={[
            { key: 'order_id', label: 'Order ID', width: '150px' },
            {
              key: 'payer_name',
              label: 'Payer / Seller',
              render: (val, row) => (
                <div>
                  <strong>{val || 'Unknown Payer'}</strong>
                  <br />
                  <small style={{ color: '#64748b' }}>{row.payer_email || '-'}</small>
                </div>
              ),
            },
            { key: 'payer_phone', label: 'Contact Phone' },
            {
              key: 'plan',
              label: 'Plan Tier',
              render: val => <span className="report-badge report-badge--blue">{formatPlan(val)}</span>,
            },
            {
              key: 'amount',
              label: 'Amount (LKR)',
              align: 'right',
              render: val => <strong>Rs. {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>,
            },
            {
              key: 'provider',
              label: 'Gateway Provider',
              render: val => (val === 'payhere' ? 'PayHere Gateway' : val === 'payhere_demo' ? 'PayHere Sandbox' : 'Bank Slip Transfer'),
            },
            {
              key: 'status',
              label: 'Status',
              render: val => {
                const isPaid = ['paid', 'demo_paid'].includes(val)
                return <span className={`report-badge ${isPaid ? 'report-badge--green' : 'report-badge--yellow'}`}>{val || 'Pending'}</span>
              },
            },
            {
              key: 'paid_at',
              label: 'Recorded Date',
              render: (val, row) => new Date(val || row.created_at || Date.now()).toLocaleDateString('en-GB'),
            },
          ]}
          kpis={[
            { label: 'Settled Revenue', value: `Rs. ${paidTotal.toLocaleString()}`, icon: '💰', sub: 'Verified payments' },
            { label: 'Total Inflow Records', value: payments.length, icon: '🧾', sub: 'Total transaction logs' },
            { label: 'Verified Paid', value: payments.filter(p => ['paid', 'demo_paid'].includes(p.status)).length, icon: '✓', sub: 'Completed checkouts' },
            { label: 'Pending Review', value: payments.filter(p => p.status === 'pending').length, icon: '⏳', sub: 'Manual transfer slips' },
          ]}
          summaryRows={[
            {
              label: 'TOTAL RECORDED REVENUE (LKR)',
              value: `Rs. ${payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            },
          ]}
          csvFilename={`knw_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportFinancialReport}
          onClose={() => setActiveReportModal(null)}
          initialPrint={initialPrint}
        />
      )
    }

    if (type === 'inquiries') {
      const siteVisitsCount = propertyInquiries.filter(i => i.is_site_visit).length
      const confirmedCount = propertyInquiries.filter(i => i.visit_status === 'confirmed').length

      return (
        <ReportViewerModal
          title="Buyer Leads, Site Visits & Market Inquiries Audit"
          subtitle="Official audit registry of inbound buyer leads, physical on-site inspection bookings, and seller correspondence status."
          reportCode={`KNW-REP-LEADS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={propertyInquiries}
          columns={[
            { key: 'id', label: 'Inq #', width: '60px' },
            {
              key: 'buyer_name',
              label: 'Buyer Contact',
              render: (val, row) => (
                <div>
                  <strong>{val || 'Prospective Buyer'}</strong>
                  <br />
                  <small style={{ color: '#64748b' }}>{row.buyer_email || '-'}</small>
                </div>
              ),
            },
            { key: 'buyer_phone', label: 'Phone' },
            {
              key: 'property',
              label: 'Target Property & Location',
              render: (val, row) => (
                <div>
                  <strong>{row.property?.property_type || 'Property'}</strong>
                  <br />
                  <small style={{ color: '#059669' }}>{row.property?.district || 'Sri Lanka'}</small>
                </div>
              ),
            },
            {
              key: 'is_site_visit',
              label: 'Inquiry Class',
              render: (val, row) =>
                val ? (
                  <span className="report-badge report-badge--blue">
                    📅 Site Inspection ({row.visit_slot || 'Standard'})
                  </span>
                ) : (
                  <span className="report-badge report-badge--yellow">💬 General Inquiry</span>
                ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (val, row) => {
                const s = row.is_site_visit ? row.visit_status : val
                const cls =
                  s === 'confirmed' || s === 'contacted'
                    ? 'report-badge--green'
                    : s === 'cancelled'
                    ? 'report-badge--red'
                    : 'report-badge--yellow'
                return <span className={`report-badge ${cls}`}>{s || 'New'}</span>
              },
            },
            {
              key: 'created_at',
              label: 'Date',
              render: val => new Date(val || Date.now()).toLocaleDateString('en-GB'),
            },
            {
              key: 'message',
              label: 'Inquiry Details / Note',
              render: val => (
                <span style={{ fontSize: '0.74rem', color: '#475569' }}>
                  {val ? (val.length > 55 ? val.slice(0, 55) + '...' : val) : '-'}
                </span>
              ),
            },
          ]}
          kpis={[
            { label: 'Total Buyer Leads', value: propertyInquiries.length, icon: '📨', sub: 'Inbound demand' },
            { label: 'Physical Site Inspections', value: siteVisitsCount, icon: '📅', sub: 'On-site bookings' },
            { label: 'Confirmed Visits', value: confirmedCount, icon: '✓', sub: 'Seller confirmed' },
            { label: 'New / Unanswered', value: propertyInquiries.filter(i => i.status === 'new').length, icon: '⏳', sub: 'Needs follow-up' },
          ]}
          csvFilename={`knw_leads_inquiries_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportInquiriesReport}
          onClose={() => setActiveReportModal(null)}
          initialPrint={initialPrint}
        />
      )
    }

    if (type === 'inventory') {
      const deedVerifiedCount = publishedListings.filter(l => l.is_deed_verified).length
      const featuredCount = publishedListings.filter(l => l.listing_plan === 'featured').length
      const totalInquiries = publishedListings.reduce((sum, l) => sum + (l.inquiries_count || 0), 0)

      return (
        <ReportViewerModal
          title="Property Inventory, Valuation & Deed Verification Status"
          subtitle="Official portfolio registry of published real estate properties, legal title deed verification, and buyer market demand."
          reportCode={`KNW-REP-INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={publishedListings}
          columns={[
            { key: 'id', label: 'Prop ID', width: '70px' },
            { key: 'property_type', label: 'Property Type' },
            { key: 'district', label: 'District' },
            {
              key: 'expected_price',
              label: 'Asking Price',
              render: val => <strong>{val || 'Price on Call'}</strong>,
            },
            {
              key: 'listing_plan',
              label: 'Plan Tier',
              render: val => (
                <span
                  className={`report-badge ${
                    val === 'featured'
                      ? 'report-badge--green'
                      : val === 'verified'
                      ? 'report-badge--blue'
                      : 'report-badge--yellow'
                  }`}
                >
                  {formatPlan(val)}
                </span>
              ),
            },
            {
              key: 'is_deed_verified',
              label: 'Legal Due Diligence',
              render: val =>
                val ? (
                  <span className="report-badge report-badge--green">✓ Verified Deeds</span>
                ) : (
                  <span className="report-badge report-badge--yellow">Standard Review</span>
                ),
            },
            {
              key: 'inquiries_count',
              label: 'Buyer Inquiries',
              align: 'center',
              render: val => <strong>{val || 0} leads</strong>,
            },
            {
              key: 'published_at',
              label: 'Published Date',
              render: val => new Date(val || Date.now()).toLocaleDateString('en-GB'),
            },
          ]}
          kpis={[
            { label: 'Published Listings', value: publishedListings.length, icon: '🏡', sub: 'Live on portal' },
            {
              label: 'Deed Verified',
              value: deedVerifiedCount,
              icon: '🛡️',
              sub: `${publishedListings.length ? Math.round((deedVerifiedCount / publishedListings.length) * 100) : 0}% compliance`,
            },
            { label: 'Featured Properties', value: featuredCount, icon: '⭐', sub: 'High visibility tier' },
            { label: 'Total Inquiries Generated', value: totalInquiries, icon: '📈', sub: 'Buyer demand volume' },
          ]}
          csvFilename={`knw_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportInventoryReport}
          onClose={() => setActiveReportModal(null)}
          initialPrint={initialPrint}
        />
      )
    }

    if (type === 'kpi_summary') {
      const kpiRows = [
        { category: 'Financial', metric: 'Gross Recorded Platform Revenue', value: `Rs. ${Number(summary?.payments_total || 0).toLocaleString()}`, status: 'Audited' },
        { category: 'Financial', metric: 'Pending Payment Clearance', value: `Rs. ${Number(summary?.payments_pending || 0).toLocaleString()}`, status: 'Review Needed' },
        { category: 'Membership', metric: 'Total Registered Platform Users', value: summary?.total_users || 0, status: 'Active' },
        { category: 'Membership', metric: 'Registered Buyers & Investors', value: summary?.buyers || 0, status: 'Active' },
        { category: 'Membership', metric: 'Registered Sellers & Landowners', value: summary?.sellers || 0, status: 'Active' },
        { category: 'Operations Queue', metric: 'Pending Seller Identity Approvals', value: summary?.pending_sellers || 0, status: summary?.pending_sellers ? 'Action Required' : 'Clear' },
        { category: 'Operations Queue', metric: 'Pending Property Listings Review', value: summary?.pending_listings || 0, status: summary?.pending_listings ? 'Action Required' : 'Clear' },
        { category: 'Operations Queue', metric: 'Pending Legal Consultations', value: summary?.pending_appointments || 0, status: summary?.pending_appointments ? 'Action Required' : 'Clear' },
        { category: 'Content Review', metric: 'Pending Blog & Legal Submissions', value: summary?.pending_blog_posts || 0, status: 'In Review' },
        { category: 'Content Review', metric: 'Pending Client Reviews', value: summary?.pending_reviews || 0, status: 'In Review' },
        { category: 'Personnel', metric: 'Active Lawyers & Legal Advisors', value: summary?.lawyers || 0, status: 'Active' },
        { category: 'Personnel', metric: 'Platform Staff Operators', value: summary?.staff || 0, status: 'Active' },
        { category: 'Compliance', metric: 'Suspended Accounts', value: summary?.suspended || 0, status: 'Restricted' },
        { category: 'Growth Velocity', metric: 'New Registrations Today', value: summary?.new_today || 0, status: 'Growing' },
      ]

      return (
        <ReportViewerModal
          title="Executive Platform Operations & Revenue KPI Summary"
          subtitle="Certified executive performance snapshot covering user registration velocity, seller pipeline, lawyer consultations, and platform financials."
          reportCode={`KNW-REP-EXEC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={kpiRows}
          columns={[
            { key: 'category', label: 'Department / Category', render: val => <strong>{val}</strong> },
            { key: 'metric', label: 'Key Performance Indicator' },
            { key: 'value', label: 'Reported Metric Value', render: val => <strong>{val}</strong> },
            {
              key: 'status',
              label: 'Operational Status',
              render: val => {
                const cls =
                  val === 'Action Required' || val === 'Review Needed'
                    ? 'report-badge--yellow'
                    : val === 'Restricted'
                    ? 'report-badge--red'
                    : 'report-badge--green'
                return <span className={`report-badge ${cls}`}>{val}</span>
              },
            },
          ]}
          kpis={[
            { label: 'Total Users', value: summary?.total_users || 0, icon: '👥', sub: 'Registered members' },
            { label: 'Platform Revenue', value: `Rs. ${Number(summary?.payments_total || 0).toLocaleString()}`, icon: '💰', sub: 'Gross collections' },
            {
              label: 'Actionable Queue',
              value: (summary?.pending_sellers || 0) + (summary?.pending_listings || 0) + (summary?.pending_appointments || 0),
              icon: '⚡',
              sub: 'Pending reviews',
            },
            { label: 'Live Catalog', value: publishedListings.length, icon: '🏡', sub: 'Published properties' },
          ]}
          csvFilename={`knw_executive_kpi_summary_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportKPISummaryCSV}
          onClose={() => setActiveReportModal(null)}
          initialPrint={initialPrint}
        />
      )
    }

    return null
  }

  async function runAction(action) {
    setMessage('')
    setError('')
    try {
      const res = await action()
      setMessage(res.data.message || 'Updated successfully.')
      await loadDashboard()
    } catch (err) {
      setError(getApiError(err, 'Action failed.'))
    }
  }

  return (
    <div className="admin-app">
      {/* Executive Admin Header Bar (Replaces consumer Navbar) */}
      <header className="admin-header-bar">
        <div className="admin-header-bar__inner">
          <div className="admin-header-bar__brand">
            <div className="admin-header-badge">KNW</div>
            <div>
              <span className="admin-header-title">KNW PRO REALTOR</span>
              <span className="admin-header-sub">EXECUTIVE MANAGEMENT CONSOLE</span>
            </div>
          </div>

          <div className="admin-header-bar__center">
            <span className="admin-status-indicator">
              <span className="admin-pulse-dot" />
              Live Operations Mode
            </span>
          </div>

          <div className="admin-header-bar__actions">
            <button
              type="button"
              className="admin-view-site-btn"
              onClick={() => onNavigate('home')}
              title="Preview the live website as a public user"
            >
              🌐 View Website
            </button>
            <div className="admin-header-user">
              <div className="admin-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="admin-user-info">
                <strong>{user?.name}</strong>
                <span>{user?.role?.toUpperCase()}</span>
              </div>
            </div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={logout}
              title="Sign Out of Admin Console"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-shell">
        <div className="admin-heading">
          <div>
            <span className="admin-kicker">Operations Control</span>
            <h1>Admin Dashboard</h1>
            <p>Platform operations: manage users, verify sellers, audit listings, and review financials.</p>
          </div>
          <button
            type="button"
            className="admin-view-site-btn"
            style={{ padding: '8px 18px', fontSize: '0.86rem' }}
            onClick={() => onNavigate('home')}
          >
            🌐 View Website
          </button>
        </div>

        {(message || tempPassword || error) && (
          <div className={`admin-alert ${error ? 'admin-alert--error' : ''}`}>
            {error || message}
            {tempPassword && <strong> Temporary password: {tempPassword}</strong>}
          </div>
        )}

        <section className="admin-stats">
          {[
            ['Total users', summary?.total_users],
            ['Pending sellers', summary?.pending_sellers],
            ['Pending listings', summary?.pending_listings],
            ['Blog reviews', summary?.pending_blog_posts],
            ['Reviews', summary?.pending_reviews],
            ['Appointments', summary?.pending_appointments],
            ['Revenue', `Rs. ${Number(summary?.payments_total || 0).toLocaleString()}`],
            ['Staff', summary?.staff],
            ['Lawyers', summary?.lawyers],
          ].map(([label, value]) => (
            <div className="admin-stat" key={label}>
              <span>{label}</span>
              <strong>{loading ? '-' : value ?? 0}</strong>
            </div>
          ))}
        </section>

        <section className="admin-panel admin-reports-panel">
          <div className="admin-panel__head">
            <h2>📊 Executive Reports & Data Hub</h2>
            <p>Preview online without downloading, print certified PDF dossiers, or export raw CSV data.</p>
          </div>
          <div className="admin-reports-grid">
            <div className="admin-report-card">
              <div className="admin-report-icon">💰</div>
              <div className="admin-report-info">
                <strong>Financial & Revenue Ledger</strong>
                <span>Complete transaction log with seller name, plan, provider, fee, and verification status.</span>
              </div>
              <div className="admin-report-actions">
                <button
                  type="button"
                  className="admin-report-btn admin-report-btn--primary"
                  onClick={() => openReport('financial', false)}
                >
                  👁️ View Online
                </button>
                <div className="admin-report-actions-row">
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--pdf"
                    onClick={() => openReport('financial', true)}
                    title="Download or Print PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--csv"
                    onClick={exportFinancialReport}
                    title="Download CSV"
                  >
                    📊 CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-report-card">
              <div className="admin-report-icon">📨</div>
              <div className="admin-report-info">
                <strong>Buyer Leads & Inquiries Report</strong>
                <span>All submitted inquiries, buyer contact information, expected prices, and intent messages.</span>
              </div>
              <div className="admin-report-actions">
                <button
                  type="button"
                  className="admin-report-btn admin-report-btn--primary"
                  onClick={() => openReport('inquiries', false)}
                >
                  👁️ View Online
                </button>
                <div className="admin-report-actions-row">
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--pdf"
                    onClick={() => openReport('inquiries', true)}
                    title="Download or Print PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--csv"
                    onClick={exportInquiriesReport}
                    title="Download CSV"
                  >
                    📊 CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-report-card">
              <div className="admin-report-icon">🏡</div>
              <div className="admin-report-info">
                <strong>Property Inventory & Deed Report</strong>
                <span>Published properties catalog, listing plan, deed verification status, and inquiry count.</span>
              </div>
              <div className="admin-report-actions">
                <button
                  type="button"
                  className="admin-report-btn admin-report-btn--primary"
                  onClick={() => openReport('inventory', false)}
                >
                  👁️ View Online
                </button>
                <div className="admin-report-actions-row">
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--pdf"
                    onClick={() => openReport('inventory', true)}
                    title="Download or Print PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--csv"
                    onClick={exportInventoryReport}
                    title="Download CSV"
                  >
                    📊 CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-report-card">
              <div className="admin-report-icon">🖨️</div>
              <div className="admin-report-info">
                <strong>Executive Summary KPI Slip</strong>
                <span>Platform summary snapshot, active queue counts, and gross revenue metrics for executive review.</span>
              </div>
              <div className="admin-report-actions">
                <button
                  type="button"
                  className="admin-report-btn admin-report-btn--primary"
                  onClick={() => openReport('kpi_summary', false)}
                >
                  👁️ View Online
                </button>
                <div className="admin-report-actions-row">
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--pdf"
                    onClick={() => openReport('kpi_summary', true)}
                    title="Download or Print PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    type="button"
                    className="admin-report-sub-btn admin-report-sub-btn--csv"
                    onClick={exportKPISummaryCSV}
                    title="Download CSV"
                  >
                    📊 CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-grid">
          {isAdmin && (
            <form className="admin-panel" onSubmit={createBlogPost}>
              <div className="admin-panel__head">
                <h2>{editingBlogId ? 'Edit blog post' : 'Add blog post'}</h2>
                <p>{editingBlogId ? 'Update the selected post details.' : 'Admin-created posts are published immediately.'}</p>
              </div>
              <label>Title<input value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} required /></label>
              <label>Excerpt<textarea value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} /></label>
              <label>Content<textarea rows="5" value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} required /></label>
              <label>Category<input value={blogForm.category} onChange={e => setBlogForm({ ...blogForm, category: e.target.value })} /></label>
              <label>Tags<input value={blogForm.tags} onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })} placeholder="Legal, Land, Tax" /></label>
              <div className="admin-actions">
                <button className="admin-primary" type="submit">{editingBlogId ? 'Save changes' : 'Publish post'}</button>
                {editingBlogId && <button type="button" onClick={cancelBlogEdit}>Cancel</button>}
              </div>
            </form>
          )}

          <section className="admin-panel admin-panel--wide">
            <div className="admin-panel__head">
              <h2>Blog post approval</h2>
              <p>Review lawyer submissions before they appear on the public blog.</p>
            </div>
            <div className="admin-list">
              {blogPosts.length === 0 && <p className="admin-empty">No blog posts yet.</p>}
              {blogPosts.map(post => (
                <div className="admin-list-item admin-list-item--stack" key={post.id}>
                  <div>
                    <strong>{post.title}</strong>
                    <span>{post.category} - {post.status} - {post.author?.name || 'Unknown author'}</span>
                    {post.excerpt && <p className="admin-mini-text">{post.excerpt}</p>}
                  </div>
                  <div className="admin-actions">
                    <button onClick={() => editBlogPost(post)}>Edit</button>
                    {post.status === 'pending_review' && <button onClick={() => approveBlogPost(post.id)}>Approve</button>}
                    {post.status === 'pending_review' && <button className="admin-danger" onClick={() => rejectBlogPost(post.id)}>Reject</button>}
                    {isAdmin && <button className="admin-danger" onClick={() => deleteBlogPost(post.id)}>Delete</button>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="admin-panel admin-listings-panel">
          <div className="admin-panel__head">
            <h2>Legal appointments ({appointments.length})</h2>
            <p>Monitor consultations (Video Calls & Law Office Visits), audit 25% platform revenue, and approve bank deposit slips.</p>
          </div>
          <div className="admin-list">
            {appointments.length === 0 && <p className="admin-empty">No appointments yet.</p>}
            {appointments.map(item => (
              <div className="admin-list-item admin-list-item--stack" key={item.id}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: item.consultation_type === 'office' ? '#ecfdf5' : '#eff6ff', color: item.consultation_type === 'office' ? '#065f46' : '#1e40af', fontWeight: '700' }}>
                      {item.consultation_type === 'office' ? '🏢 In-Person Office Visit' : '📹 Online Video Call'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: '600', textTransform: 'capitalize' }}>
                      👤 {item.user_role || 'Client'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: item.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: item.payment_status === 'paid' ? '#15803d' : '#b45309', fontWeight: '700' }}>
                      {item.payment_status === 'paid' ? `✓ Paid (Rs. ${Number(item.fee_amount || 5000).toLocaleString()})` : '⏳ Bank Slip Pending Clearance'}
                    </span>
                  </div>

                  <strong>{item.customer_name} with {item.lawyer?.name || 'Assigned Attorney'}</strong>
                  <span>📅 {item.appointment_date} at {item.start_time} - Topic: {item.topic} ({item.status})</span>
                  <p className="admin-mini-text">{item.customer_email} {item.customer_phone ? `- ${item.customer_phone}` : ''}</p>

                  {item.consultation_type === 'office' && (
                    <p className="admin-mini-text" style={{ color: '#047857' }}>
                      📍 <strong>Chambers:</strong> {item.office_location || item.lawyer?.lawyer_profile?.office_location || 'Attorney Chambers, Colombo 03'}
                    </p>
                  )}

                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', margin: '6px 0', fontSize: '0.8rem', color: '#334155', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>Fee: <strong>Rs. {Number(item.fee_amount || 5000).toLocaleString()}</strong></span>
                    <span style={{ color: '#15803d' }}>Platform Profit (25%): <strong>Rs. {Number(item.platform_commission || 1250).toLocaleString()}</strong></span>
                    <span style={{ color: '#2563eb' }}>Lawyer Share (75%): <strong>Rs. {Number(item.lawyer_earnings || 3750).toLocaleString()}</strong></span>
                  </div>

                  {item.bank_slip_url && (
                    <div style={{ margin: '6px 0' }}>
                      <a
                        href={item.bank_slip_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', textDecoration: 'underline' }}
                      >
                        📄 View Uploaded Bank Deposit Slip
                      </a>
                    </div>
                  )}
                </div>
                <div className="admin-actions">
                  {item.payment_status === 'pending_verification' && (
                    <button
                      type="button"
                      style={{ background: '#059669', color: '#fff', fontWeight: '700' }}
                      onClick={() => approveAppointmentPayment(item.id)}
                    >
                      ✓ Approve Slip & Confirm
                    </button>
                  )}
                  {item.status === 'confirmed' && item.video_meeting_url && (
                    <a
                      href={item.video_meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      📹 Join Video Consultation
                    </a>
                  )}
                  <button onClick={() => updateAppointment(item.id, 'confirmed')}>Confirm</button>
                  <button onClick={() => updateAppointment(item.id, 'completed')}>Complete</button>
                  <button className="admin-danger" onClick={() => updateAppointment(item.id, 'cancelled')}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-listings-panel">
          <div className="admin-panel__head">
            <h2>Property inquiries</h2>
            <p>Track buyer messages sent from public property detail pages.</p>
          </div>
          <div className="admin-list">
            {propertyInquiries.length === 0 && <p className="admin-empty">No property inquiries yet.</p>}
            {propertyInquiries.map(item => (
              <div className="admin-list-item admin-list-item--stack" key={item.id}>
                <div>
                  <strong>{item.buyer_name} - {item.property?.property_type} in {item.property?.district}</strong>
                  <span>{item.buyer_email} {item.buyer_phone ? `- ${item.buyer_phone}` : ''} - {item.status}</span>
                  <p className="admin-mini-text">{item.message || 'No buyer message added.'}</p>
                </div>
                <div className="admin-actions">
                  <button onClick={() => updatePropertyInquiry(item.id, 'contacted')}>Mark contacted</button>
                  <button onClick={() => updatePropertyInquiry(item.id, 'closed')}>Close</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-listings-panel">
          <div className="admin-panel__head">
            <h2>Payment records</h2>
            <p>Monitor demo payments, manual payments, and PayHere checkout orders.</p>
          </div>
          <div className="admin-list">
            {payments.length === 0 && <p className="admin-empty">No payment records yet.</p>}
            {payments.map(payment => (
              <div className="admin-list-item admin-list-item--stack" key={payment.id}>
                <div>
                  <strong>{payment.order_id} - {payment.currency} {Number(payment.amount).toLocaleString()}</strong>
                  <span>{payment.provider} - {payment.status} - {payment.plan || 'listing'}</span>
                  <p className="admin-mini-text">
                    {payment.payer_name || payment.user?.name || 'Unknown payer'} {payment.payer_email ? `- ${payment.payer_email}` : ''}
                  </p>
                  {payment.property && <p className="admin-mini-text">{payment.property.property_type} in {payment.property.district}</p>}
                </div>
                <span className={`status-pill status-${payment.status}`}>{payment.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-listings-panel">
          <div className="admin-panel__head">
            <h2>Customer reviews</h2>
            <p>Customer reviews submitted directly by buyers. Admins can delete inappropriate or spam reviews (reviews cannot be edited by admin to preserve buyer feedback integrity).</p>
          </div>
          <div className="admin-list">
            {reviews.length === 0 && <p className="admin-empty">No reviews yet.</p>}
            {reviews.map(review => (
              <div className="admin-list-item admin-list-item--stack" key={review.id}>
                <div>
                  <strong>{review.rating}/5 - {review.title || review.name}</strong>
                  <span>{review.name} ({review.email || 'Buyer'}) - {review.type} - {review.status === 'approved' ? 'Published' : review.status}</span>
                  <p className="admin-mini-text">"{review.comment}"</p>
                  {review.property && <p className="admin-mini-text">Property: {review.property.property_type} in {review.property.district}</p>}
                </div>
                <div className="admin-actions">
                  <button className="admin-danger" onClick={() => deleteReview(review.id)}>
                    🗑️ Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-listings-panel">
          <div className="admin-panel__head">
            <h2>Published listings</h2>
            <p>Approved listings currently visible on the public marketplace.</p>
          </div>
          <div className="admin-listings">
            {publishedListings.length === 0 && <p className="admin-empty">No published listings yet.</p>}
            {publishedListings.map(listing => (
              <article className="admin-listing-card" key={listing.id}>
                <div className="admin-listing-card__top">
                  <div>
                    <strong>{listing.property_type} in {listing.district}</strong>
                    <span>{listing.expected_price} - {listing.contact_number}</span>
                  </div>
                  <span className="status-pill status-active">Published</span>
                </div>
                {listing.description && <p className="admin-listing-desc">{listing.description}</p>}
                <div className="admin-listing-meta">
                  <span>Seller: {listing.seller?.name || listing.seller_name || 'Not linked'}</span>
                  <span>Plan: {formatPlan(listing.listing_plan)} - Rs. {(listing.listing_fee || 0).toLocaleString()}</span>
                  <span>Published: {listing.published_at ? new Date(listing.published_at).toLocaleDateString() : 'Recently'}</span>
                  <span>Inquiries: {listing.inquiries_count || 0}</span>
                  <span>Visits: {formatVisitOptions(listing)}</span>
                </div>
                <AdminMediaPreview listing={listing} />
                <div className="admin-actions">
                  <button onClick={() => window.location.href = `/property/${listing.id}`}>View public page</button>
                  <button
                    style={{
                      background: listing.is_deed_verified ? '#ecfdf5' : '#ffffff',
                      color: listing.is_deed_verified ? '#059669' : '#334155',
                      border: listing.is_deed_verified ? '1px solid #10b981' : '1px solid #cbd5e1',
                      fontWeight: '700',
                    }}
                    onClick={() => toggleDeedVerified(listing.id)}
                  >
                    {listing.is_deed_verified ? '🛡️ Deed Verified (Revoke)' : '🛡️ Mark Deed Verified'}
                  </button>
                  {listing.location_url && <button onClick={() => window.open(listing.location_url, '_blank')}>Open map</button>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-listings-panel">
          <div className="admin-panel__head">
            <h2>Pending listing drafts</h2>
            <p>Review seller property details, document readiness, and site visit permission before publishing.</p>
          </div>
          <div className="admin-listings">
            {pendingListings.length === 0 && <p className="admin-empty">No listing drafts waiting for review.</p>}
            {pendingListings.map(listing => (
              <article className="admin-listing-card" key={listing.id}>
                <div className="admin-listing-card__top">
                  <div>
                    <strong>{listing.property_type} in {listing.district}</strong>
                    <span>{listing.expected_price} · {listing.contact_number}</span>
                  </div>
                  <span className="status-pill status-pending">Pending review</span>
                </div>

                {listing.description && <p className="admin-listing-desc">{listing.description}</p>}

                <div className="admin-listing-meta">
                  <span>Seller: {listing.seller?.name || listing.seller_name || 'Not linked'}</span>
                  <span>Visit: {listing.preferred_visit_date || 'No date'} · {listing.visit_time || 'No time'}</span>
                  <span>Site permission: {listing.visit_permission ? 'Granted' : 'Missing'}</span>
                  <span>Terms: {listing.terms_accepted ? 'Accepted' : 'Missing'}</span>
                  <span>Plan: {formatPlan(listing.listing_plan)} - Rs. {(listing.listing_fee || 0).toLocaleString()}</span>
                  <span>Payment: {listing.payment_status || 'pending'} via {listing.payment_method || 'not set'}</span>
                  <span>Reference: {listing.payment_reference || 'Missing'}</span>
                </div>

                {listing.payment_note && <p className="admin-listing-desc">{listing.payment_note}</p>}
                <div className="admin-listing-meta">
                  <span>Visits: {formatVisitOptions(listing)}</span>
                  <span>Map: {listing.location_url || (listing.latitude && listing.longitude ? `${listing.latitude}, ${listing.longitude}` : 'Missing')}</span>
                </div>
                <AdminMediaPreview listing={listing} />

                <div className="admin-doc-tags">
                  {(listing.documents || []).length === 0 && <span>No documents marked yet</span>}
                  {(listing.documents || []).map(doc => <span key={doc}>{doc}</span>)}
                </div>

                <div className="admin-actions">
                  {listing.payment_status !== 'paid' && <button onClick={() => markListingPaid(listing.id)}>Mark paid</button>}
                  <button onClick={() => approveListing(listing.id)} disabled={listing.payment_status !== 'paid'}>Approve & publish</button>
                  <button className="admin-danger" onClick={() => rejectListing(listing.id)}>Reject draft</button>
                  {listing.location_url && <button onClick={() => window.open(listing.location_url, '_blank')}>Open map</button>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-grid">
          {isAdmin && (
            <form className="admin-panel" onSubmit={createAccount}>
              <div className="admin-panel__head">
                <h2>Add staff or lawyer</h2>
                <p>Create trusted internal accounts with active status.</p>
              </div>
              <label>
                Name
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                Role
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff member</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </label>
              <button className="admin-primary" type="submit">Create account</button>
            </form>
          )}

          <section className="admin-panel admin-panel--wide">
            <div className="admin-panel__head">
              <h2>Pending seller approvals & identity verification</h2>
              <p>Admin must review national ID/passport documents before approving sellers to publish listings.</p>
            </div>
            <div className="admin-list">
              {pendingSellers.length === 0 && <p className="admin-empty">No pending sellers waiting for review.</p>}
              {pendingSellers.map(seller => (
                <div className="admin-list-item admin-list-item--stack" key={seller.id}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '1rem' }}>{seller.name}</strong>
                      <span className="status-pill status-pending">Pending Verification</span>
                    </div>
                    <span>📧 {seller.email} {seller.phone ? `· 📞 ${seller.phone}` : ''}</span>
                    <p className="admin-mini-text" style={{ marginTop: '4px' }}>
                      <strong>NIC / ID No:</strong> {seller.nic_number || 'Not provided'} |{' '}
                      <strong>Address:</strong> {seller.address || 'Not provided'} |{' '}
                      <strong>Joined:</strong> {new Date(seller.created_at || Date.now()).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="admin-actions">
                    {seller.nic_document_path ? (
                      <a
                        href={`/api/admin/sellers/${seller.id}/document`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #93c5fd',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        📄 View NIC / ID Document
                      </a>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', alignSelf: 'center' }}>
                        No file uploaded
                      </span>
                    )}
                    <button className="admin-primary" onClick={() => approveSeller(seller.id)}>✓ Approve Seller</button>
                    <button className="admin-danger" onClick={() => rejectSeller(seller.id)}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="admin-panel admin-users">
          <div className="admin-panel__head admin-users-head">
            <div>
              <h2>All users</h2>
              <p>Search, filter, suspend, and adjust roles.</p>
            </div>
            <div className="admin-filters">
              <input placeholder="Search" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
              <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="lawyer">Lawyer</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <span>{item.email}</span>
                    </td>
                    <td>
                      <select value={item.role} onChange={e => updateRole(item.id, e.target.value)} disabled={!isAdmin || item.role === 'admin'}>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="lawyer">Lawyer</option>
                        <option value="seller">Seller</option>
                        <option value="buyer">Buyer</option>
                      </select>
                    </td>
                    <td><span className={`status-pill status-${item.status}`}>{item.status}</span></td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        {item.role !== 'admin' && (
                          <button onClick={() => suspendUser(item.id)}>
                            {item.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                        {isAdmin && item.role !== 'admin' && (
                          <button className="admin-danger" onClick={() => deleteUser(item.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {renderActiveReportModal()}
    </div>
  )
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}

function formatPlan(plan) {
  const labels = {
    basic: 'Basic Listing',
    verified: 'Verified Listing',
    featured: 'Featured Listing',
  }
  return labels[plan] || 'Basic Listing'
}

function formatVisitOptions(listing) {
  const dates = listing.visit_dates || []
  const days = listing.visit_days || []
  const parts = [...dates, ...days]
  if (listing.visit_time) parts.push(listing.visit_time)
  return parts.length ? parts.join(', ') : 'No visit times'
}

function storageUrl(path) {
  if (!path) return ''
  if (String(path).startsWith('http')) return path
  return `/storage/${path}`
}

function AdminMediaPreview({ listing }) {
  const images = listing.property_images || []

  if (images.length === 0 && !listing.payment_slip_path) return null

  return (
    <div className="admin-media-preview">
      {images.length > 0 && (
        <div className="admin-media-thumbs">
          {images.slice(0, 4).map(path => (
            <a href={storageUrl(path)} target="_blank" rel="noreferrer" key={path}>
              <img src={storageUrl(path)} alt="Property upload" />
            </a>
          ))}
        </div>
      )}
      {listing.payment_slip_path && (
        <a className="admin-slip-link" href={storageUrl(listing.payment_slip_path)} target="_blank" rel="noreferrer">
          View payment slip
        </a>
      )}
    </div>
  )
}
