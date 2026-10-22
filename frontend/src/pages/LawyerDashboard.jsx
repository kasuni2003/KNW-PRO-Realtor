import axios from 'axios'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import ReportViewerModal from '../components/ReportViewerModal'
import './AdminDashboard.css'
import './LawyerDashboard.css'

const emptyPost = { title: '', excerpt: '', content: '', category: 'Legal Tips', tags: '' }
const emptyAvailability = { weekday: '1', start_time: '09:00', end_time: '12:00', slot_minutes: '30' }
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function LawyerDashboard({ onNavigate }) {
  const { user, changePassword, switchRole, authError, setAuthError } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [posts, setPosts] = useState([])
  const [postForm, setPostForm] = useState(emptyPost)
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null)
  const [profile, setProfile] = useState({ specialization: '', bio: '', office_location: '', consultation_fee: '', languages: 'English, Sinhala, Tamil', is_available: true })
  const [availability, setAvailability] = useState(emptyAvailability)
  const [blockedDate, setBlockedDate] = useState({ date: '', reason: '' })
  const [rescheduleForms, setRescheduleForms] = useState({})
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [propertyVerifications, setPropertyVerifications] = useState([])
  const [verifFilter, setVerifFilter] = useState('all')
  const [verifNotes, setVerifNotes] = useState({})
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [modalPrint, setModalPrint] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const canUse = user?.role === 'lawyer'

  useEffect(() => {
    if (!canUse) return
    loadDashboard()
  }, [canUse])

  if (!canUse) {
    return (
      <div className="app">
        <Navbar onNavigate={onNavigate} currentPage="lawyer" />
        <main className="admin-shell admin-access">
          <h1>Lawyer access only</h1>
          <p>Sign in with a lawyer account to manage legal posts and appointments.</p>
          <button className="admin-primary" onClick={() => onNavigate('login')}>Sign in as lawyer</button>
        </main>
        <Footer onNavigate={onNavigate} />
      </div>
    )
  }

  async function loadDashboard() {
    setError('')
    try {
      const [dashboardRes, postsRes, verifsRes] = await Promise.all([
        axios.get(`/api/lawyer/${user.id}/dashboard`),
        axios.get(`/api/lawyer/posts?author_id=${user.id}`),
        axios.get('/api/lawyer/property-verifications').catch(() => ({ data: { data: [] } })),
      ])
      setDashboard(dashboardRes.data)
      setPosts(postsRes.data.data || [])
      setPropertyVerifications(verifsRes.data.data || [])
      const currentProfile = dashboardRes.data.lawyer?.lawyer_profile
      if (currentProfile) {
        setProfile({
          specialization: currentProfile.specialization || '',
          bio: currentProfile.bio || '',
          office_location: currentProfile.office_location || '',
          consultation_fee: currentProfile.consultation_fee || '',
          languages: (currentProfile.languages || []).join(', '),
          is_available: Boolean(currentProfile.is_available),
        })
      }
    } catch (err) {
      setError(getApiError(err, 'Could not load lawyer dashboard.'))
    }
  }

  async function savePost(event, submit = false) {
    event.preventDefault()
    await runAction(async () => {
      const payload = {
        ...postForm,
        author_id: user.id,
        status: submit ? 'pending_review' : 'draft',
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      }
      const res = editingPostId
        ? await axios.patch(`/api/lawyer/posts/${editingPostId}`, payload)
        : await axios.post('/api/lawyer/posts', payload)
      if (submit && editingPostId) {
        await axios.patch(`/api/lawyer/posts/${editingPostId}/submit`)
      }
      setPostForm(emptyPost)
      setEditingPostId(null)
      await loadDashboard()
      return res
    })
  }

  function editPost(post) {
    setEditingPostId(post.id)
    setPostForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Legal Tips',
      tags: (post.tags || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditPost() {
    setEditingPostId(null)
    setPostForm(emptyPost)
  }

  async function submitPost(id) {
    await runAction(() => axios.patch(`/api/lawyer/posts/${id}/submit`))
  }

  async function saveProfile(event) {
    event.preventDefault()
    await runAction(() => axios.put(`/api/lawyer/${user.id}/profile`, {
      ...profile,
      languages: profile.languages.split(',').map(item => item.trim()).filter(Boolean),
      consultation_fee: profile.consultation_fee || null,
    }))
  }

  async function addAvailability(event) {
    event.preventDefault()
    await runAction(async () => {
      const res = editingAvailabilityId
        ? await axios.patch(`/api/lawyer/availability/${editingAvailabilityId}`, availability)
        : await axios.post(`/api/lawyer/${user.id}/availability`, availability)
      setAvailability(emptyAvailability)
      setEditingAvailabilityId(null)
      await loadDashboard()
      return res
    })
  }

  function editAvailability(item) {
    setEditingAvailabilityId(item.id)
    setAvailability({
      weekday: String(item.weekday),
      start_time: formatTime(item.start_time),
      end_time: formatTime(item.end_time),
      slot_minutes: String(item.slot_minutes),
    })
  }

  function cancelAvailabilityEdit() {
    setEditingAvailabilityId(null)
    setAvailability(emptyAvailability)
  }

  async function removeAvailability(id) {
    await runAction(() => axios.delete(`/api/lawyer/availability/${id}`))
  }

  async function blockDay(event) {
    event.preventDefault()
    await runAction(async () => {
      const res = await axios.post(`/api/lawyer/${user.id}/blocked-dates`, blockedDate)
      setBlockedDate({ date: '', reason: '' })
      await loadDashboard()
      return res
    })
  }

  async function updateAppointment(id, status, extra = {}) {
    await runAction(() => axios.patch(`/api/lawyer/appointments/${id}`, { status, ...extra }))
  }

  async function rescheduleAppointment(item) {
    const form = rescheduleForms[item.id] || {}
    await updateAppointment(item.id, 'rescheduled', {
      appointment_date: form.appointment_date,
      start_time: form.start_time,
      lawyer_note: form.lawyer_note || 'Please confirm whether this new time works for you.',
    })
    setRescheduleForms(current => ({ ...current, [item.id]: {} }))
  }

  async function savePassword(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setAuthError('')

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setError('New password and confirmation do not match.')
      return
    }

    const ok = await changePassword(passwordForm)
    if (ok) {
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      onNavigate('login')
    }
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

  async function reviewPropertyDocuments(propertyId, action) {
    const note = verifNotes[propertyId] || ''
    setMessage('')
    setError('')
    setReviewLoading(true)
    try {
      const res = await axios.patch(`/api/lawyer/property-verifications/${propertyId}/review`, { action, note })
      setMessage(res.data.message || 'Property title review updated.')
      setVerifNotes(prev => ({ ...prev, [propertyId]: '' }))
      await loadDashboard()
    } catch (err) {
      setError(getApiError(err, 'Could not review property documents.'))
    } finally {
      setReviewLoading(false)
    }
  }

  const lawyer = dashboard?.lawyer
  const appointments = dashboard?.appointments || []

  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  function exportConsultationsCSV() {
    const headers = ['Appointment ID', 'Client Name', 'Client Email', 'Topic', 'Date', 'Time', 'Status', 'Client Message', 'Lawyer Note', 'Video Link']
    const rows = appointments.map(a => [
      a.id,
      `"${a.customer_name || ''}"`,
      `"${a.customer_email || ''}"`,
      `"${a.topic || ''}"`,
      `"${a.appointment_date || ''}"`,
      `"${a.start_time || ''}"`,
      `"${a.status || ''}"`,
      `"${(a.message || '').replace(/"/g, '""')}"`,
      `"${(a.lawyer_note || '').replace(/"/g, '""')}"`,
      `"${a.video_meeting_url || ''}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    downloadCSV(csv, `knw_lawyer_consultations_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div className="app">
      <Navbar onNavigate={onNavigate} currentPage="lawyer" />
      <main className="admin-shell lawyer-shell">
        <div className="admin-heading">
          <div>
            <span className="admin-kicker">Lawyer workspace</span>
            <h1>Legal content & appointments</h1>
            <p>Manage your legal blog drafts, consultation availability, and appointment requests.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="admin-link-btn"
              style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => { switchRole?.('buyer'); onNavigate('buyerDashboard') }}
              title="Switch to Buyer Mode"
            >
              🛒 Buyer Hub
            </button>
            <button
              type="button"
              className="admin-link-btn"
              style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => { switchRole?.('seller'); onNavigate('sellerDashboard') }}
              title="Switch to Seller Mode"
            >
              🏷️ Seller Hub
            </button>
            <button className="admin-link-btn" onClick={() => onNavigate('home')}>View site</button>
          </div>
        </div>

        {(message || error) && (
          <div className={`admin-alert ${error ? 'admin-alert--error' : ''}`}>{error || message}</div>
        )}
        {authError && (
          <div className="admin-alert admin-alert--error">{authError}</div>
        )}

        <section className="lawyer-grid">
          <form className="admin-panel lawyer-panel" onSubmit={savePassword}>
            <div className="admin-panel__head">
              <h2>Change password</h2>
              <p>Use the temporary password from your invite email, then set your own password.</p>
            </div>
            <label>
              Current temporary password
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={passwordForm.password}
                onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                placeholder="Minimum 8 characters, mixed case and number"
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={e => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                required
              />
            </label>
            <button className="admin-primary" type="submit">Update password</button>
          </form>

          <form className="admin-panel lawyer-panel" onSubmit={event => savePost(event, false)}>
            <div className="admin-panel__head">
              <h2>{editingPostId ? 'Edit blog post' : 'Create blog draft'}</h2>
              <p>Drafts can be submitted to admin before they appear on the public blog.</p>
            </div>
            <label>Title<input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} required /></label>
            <label>Excerpt<textarea value={postForm.excerpt} onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })} /></label>
            <label>Content<textarea rows="7" value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })} required /></label>
            <label>Category<input value={postForm.category} onChange={e => setPostForm({ ...postForm, category: e.target.value })} /></label>
            <label>Tags<input value={postForm.tags} onChange={e => setPostForm({ ...postForm, tags: e.target.value })} placeholder="Title Deed, Tax, Foreign Buyers" /></label>
            <div className="admin-actions">
              <button type="submit">{editingPostId ? 'Save changes' : 'Save draft'}</button>
              <button type="button" onClick={event => savePost(event, true)}>Submit for approval</button>
              {editingPostId && <button type="button" onClick={cancelEditPost}>Cancel</button>}
            </div>
          </form>

          <form className="admin-panel lawyer-panel" onSubmit={saveProfile}>
            <div className="admin-panel__head">
              <h2>Lawyer profile</h2>
              <p>This appears in the appointment booking area.</p>
            </div>
            <label>Specialization<input value={profile.specialization} onChange={e => setProfile({ ...profile, specialization: e.target.value })} /></label>
            <label>Office location<input value={profile.office_location} onChange={e => setProfile({ ...profile, office_location: e.target.value })} /></label>
            <label>Consultation fee<input value={profile.consultation_fee} onChange={e => setProfile({ ...profile, consultation_fee: e.target.value })} /></label>
            <label>Languages<input value={profile.languages} onChange={e => setProfile({ ...profile, languages: e.target.value })} /></label>
            <label>Bio<textarea rows="4" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} /></label>
            <label className="lawyer-check"><input type="checkbox" checked={profile.is_available} onChange={e => setProfile({ ...profile, is_available: e.target.checked })} /> Available for appointments</label>
            <button className="admin-primary" type="submit">Save profile</button>
          </form>
        </section>

        <section className="admin-panel lawyer-section">
          <div className="admin-panel__head">
            <h2>My blog posts</h2>
            <p>Only published posts are visible on the public blog.</p>
          </div>
          <div className="lawyer-card-list">
            {posts.length === 0 && <p className="admin-empty">No posts yet.</p>}
            {posts.map(post => (
              <article className="lawyer-card" key={post.id}>
                <div>
                  <strong>{post.title}</strong>
                  <span>{post.category} - {post.status}</span>
                  {post.rejection_reason && <p>{post.rejection_reason}</p>}
                </div>
                <div className="admin-actions">
                  {['draft', 'rejected'].includes(post.status) && <button onClick={() => editPost(post)}>Edit</button>}
                  {['draft', 'rejected'].includes(post.status) && <button onClick={() => submitPost(post.id)}>Submit</button>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lawyer-grid">
          <form className="admin-panel lawyer-panel" onSubmit={addAvailability}>
            <div className="admin-panel__head">
              <h2>{editingAvailabilityId ? 'Edit weekly slot' : 'Weekly availability'}</h2>
              <p>{editingAvailabilityId ? 'Update this recurring consultation window.' : 'Add recurring consultation windows.'}</p>
            </div>
            <label>Day<select value={availability.weekday} onChange={e => setAvailability({ ...availability, weekday: e.target.value })}>{weekdays.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
            <label>Start<input type="time" value={availability.start_time} onChange={e => setAvailability({ ...availability, start_time: e.target.value })} /></label>
            <label>End<input type="time" value={availability.end_time} onChange={e => setAvailability({ ...availability, end_time: e.target.value })} /></label>
            <label>Slot minutes<input value={availability.slot_minutes} onChange={e => setAvailability({ ...availability, slot_minutes: e.target.value })} /></label>
            <div className="admin-actions">
              <button className="admin-primary" type="submit">{editingAvailabilityId ? 'Save slot' : 'Add availability'}</button>
              {editingAvailabilityId && <button type="button" onClick={cancelAvailabilityEdit}>Cancel</button>}
            </div>
          </form>

          <form className="admin-panel lawyer-panel" onSubmit={blockDay}>
            <div className="admin-panel__head">
              <h2>Block unavailable date</h2>
              <p>Use this for court dates, holidays, or leave.</p>
            </div>
            <label>Date<input type="date" value={blockedDate.date} onChange={e => setBlockedDate({ ...blockedDate, date: e.target.value })} required /></label>
            <label>Reason<input value={blockedDate.reason} onChange={e => setBlockedDate({ ...blockedDate, reason: e.target.value })} /></label>
            <button className="admin-primary" type="submit">Block date</button>
          </form>
        </section>

        <section className="admin-panel lawyer-section">
          <div className="admin-panel__head">
            <h2>Current availability</h2>
          </div>
          <div className="lawyer-card-list">
            {(lawyer?.lawyer_availability || []).map(item => (
              <article className="lawyer-card" key={item.id}>
                <div><strong>{weekdays[item.weekday]}</strong><span>{item.start_time} - {item.end_time} · {item.slot_minutes} min slots</span></div>
                <div className="admin-actions">
                  <button onClick={() => editAvailability(item)}>Edit</button>
                  <button className="admin-danger" onClick={() => removeAvailability(item.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel lawyer-section">
          <div className="admin-panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Appointment requests</h2>
              <p>Manage legal consultations, video conference links, and client schedules.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setShowReportModal(true); setModalPrint(false) }}
                disabled={appointments.length === 0}
                style={{
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: '#059669',
                  color: '#ffffff',
                  border: '1px solid #059669',
                  borderRadius: '6px',
                  cursor: appointments.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="View legal consultation docket on screen or print as PDF"
              >
                👁️ View Docket / PDF
              </button>
              <button
                type="button"
                onClick={exportConsultationsCSV}
                disabled={appointments.length === 0}
                style={{
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: appointments.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                📊 CSV
              </button>
            </div>
          </div>
          <div className="lawyer-card-list">
            {appointments.length === 0 && <p className="admin-empty">No appointment requests yet.</p>}
            {appointments.map(item => (
              <article className="lawyer-card" key={item.id}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: item.consultation_type === 'office' ? '#ecfdf5' : '#eff6ff', color: item.consultation_type === 'office' ? '#065f46' : '#1e40af', fontWeight: '700' }}>
                      {item.consultation_type === 'office' ? '🏢 In-Person Office Visit' : '📹 Online Video Call'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: '600', textTransform: 'capitalize' }}>
                      👤 {item.user_role || 'Client'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: item.payment_status === 'paid' ? '#dcfce7' : '#fef3c7', color: item.payment_status === 'paid' ? '#15803d' : '#b45309', fontWeight: '700' }}>
                      {item.payment_status === 'paid' ? `✓ Paid (Your Earnings: Rs. ${Number(item.lawyer_earnings || 3750).toLocaleString()})` : '⏳ Payment Verifying'}
                    </span>
                  </div>

                  <strong>{item.customer_name} - {item.topic}</strong>
                  <span>📅 {item.appointment_date} at {item.start_time} · {item.customer_email} · Status: {item.status}</span>
                  {item.consultation_type === 'office' && (
                    <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#047857' }}>
                      📍 <strong>Chambers:</strong> {item.office_location || profile.office_location || 'Attorney Chambers, Colombo 03'}
                    </p>
                  )}
                  {item.message && <p><strong>Client note:</strong> "{item.message}"</p>}
                  {item.lawyer_note && <p><strong>Your note:</strong> "{item.lawyer_note}"</p>}
                </div>
                <div className="lawyer-appointment-tools">
                  <div className="admin-actions">
                    {item.consultation_type === 'video' && item.status === 'confirmed' && item.video_meeting_url && (
                      <a
                        href={item.video_meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        📹 Join Video Consultation
                      </a>
                    )}
                    <button onClick={() => updateAppointment(item.id, 'confirmed')}>Accept</button>
                    <button onClick={() => updateAppointment(item.id, 'completed')}>Complete</button>
                    <button className="admin-danger" onClick={() => updateAppointment(item.id, 'rejected')}>Reject</button>
                  </div>
                  <div className="lawyer-reschedule">
                    <input
                      type="date"
                      value={rescheduleForms[item.id]?.appointment_date || ''}
                      onChange={e => setRescheduleForms(current => ({ ...current, [item.id]: { ...current[item.id], appointment_date: e.target.value } }))}
                    />
                    <input
                      type="time"
                      value={rescheduleForms[item.id]?.start_time || ''}
                      onChange={e => setRescheduleForms(current => ({ ...current, [item.id]: { ...current[item.id], start_time: e.target.value } }))}
                    />
                    <input
                      placeholder="Note to client"
                      value={rescheduleForms[item.id]?.lawyer_note || ''}
                      onChange={e => setRescheduleForms(current => ({ ...current, [item.id]: { ...current[item.id], lawyer_note: e.target.value } }))}
                    />
                    <button
                      type="button"
                      onClick={() => rescheduleAppointment(item)}
                      disabled={!rescheduleForms[item.id]?.appointment_date || !rescheduleForms[item.id]?.start_time}
                    >
                      Propose new time
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Property Title & Deed Verifications */}
        <section className="admin-panel" style={{ marginTop: '24px' }}>
          <div className="admin-panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="admin-kicker">🛡️ Legal Title Inspection</span>
              <h2>Property Title & Deed Verifications ({propertyVerifications.filter(p => p.legal_status === 'submitted_for_review').length} Pending)</h2>
              <p>Inspect deeds, survey plans, and municipal certificates submitted by sellers to certify clear legal title.</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'pending', 'approved', 'rejected'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '20px',
                    border: '1px solid #cbd5e1',
                    background: verifFilter === tab ? '#1e293b' : '#f8fafc',
                    color: verifFilter === tab ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                  onClick={() => setVerifFilter(tab)}
                >
                  {tab === 'all' ? `All (${propertyVerifications.length})` :
                   tab === 'pending' ? `Pending (${propertyVerifications.filter(p => p.legal_status === 'submitted_for_review').length})` :
                   tab === 'approved' ? `Cleared (${propertyVerifications.filter(p => p.legal_status === 'approved').length})` :
                   `Rejected (${propertyVerifications.filter(p => p.legal_status === 'rejected').length})`}
                </button>
              ))}
            </div>
          </div>

          {propertyVerifications
            .filter(item => {
              if (verifFilter === 'pending') return item.legal_status === 'submitted_for_review'
              if (verifFilter === 'approved') return item.legal_status === 'approved'
              if (verifFilter === 'rejected') return item.legal_status === 'rejected'
              return true
            })
            .length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                <p>No property verification dossiers found for this filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {propertyVerifications
                  .filter(item => {
                    if (verifFilter === 'pending') return item.legal_status === 'submitted_for_review'
                    if (verifFilter === 'approved') return item.legal_status === 'approved'
                    if (verifFilter === 'rejected') return item.legal_status === 'rejected'
                    return true
                  })
                  .map(prop => (
                    <article
                      key={prop.id}
                      style={{
                        padding: '18px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        borderLeft: prop.is_deed_verified ? '5px solid #10b981' : prop.legal_status === 'rejected' ? '5px solid #ef4444' : '5px solid #f59e0b',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '16px', color: '#0f172a' }}>{prop.title}</strong>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: prop.is_deed_verified ? '#d1fae5' : prop.legal_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                color: prop.is_deed_verified ? '#065f46' : prop.legal_status === 'rejected' ? '#991b1b' : '#92400e',
                              }}
                            >
                              {prop.is_deed_verified ? '🛡️ Title Cleared' : prop.legal_status === 'rejected' ? '⚠️ Clarification Required' : '⏳ Awaiting Inspection'}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                            Price: <strong>{prop.expected_price}</strong> • District: <strong>{prop.district}</strong> • Seller: <strong>{prop.seller?.name || 'Seller'}</strong> ({prop.seller?.phone || 'No phone'})
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Submitted: {new Date(prop.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Documents Box */}
                      <div style={{ margin: '14px 0', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', display: 'block', marginBottom: '8px' }}>
                          Uploaded Legal Documents:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {prop.deed_document_url ? (
                            <a
                              href={prop.deed_document_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}
                            >
                              📄 Title Deed / Extract Copy ↗
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>📄 Title Deed: Not uploaded</span>
                          )}

                          {prop.survey_plan_url ? (
                            <a
                              href={prop.survey_plan_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}
                            >
                              📐 Survey Plan ↗
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>📐 Survey Plan: Not uploaded</span>
                          )}

                          {prop.council_document_url ? (
                            <a
                              href={prop.council_document_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}
                            >
                              🏛️ Council Clearance ↗
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>🏛️ Council: Not uploaded</span>
                          )}

                          {prop.other_document_url && (
                            <a
                              href={prop.other_document_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}
                            >
                              📎 Supporting Document ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Previous Review Note */}
                      {(prop.legal_review_note || prop.deed_verification_note) && (
                        <div style={{ marginBottom: '12px', fontSize: '12px', color: prop.is_deed_verified ? '#15803d' : '#b91c1c' }}>
                          <strong>Lawyer Recorded Note:</strong> "{prop.legal_review_note || prop.deed_verification_note}"
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="Attorney title note (e.g. 30-year folio search verified clear at Land Registry)..."
                          value={verifNotes[prop.id] || ''}
                          onChange={e => setVerifNotes(prev => ({ ...prev, [prop.id]: e.target.value }))}
                          style={{ flex: 1, minWidth: '260px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => reviewPropertyDocuments(prop.id, 'approve')}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ✓ Clear & Verify Title
                        </button>
                        <button
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => reviewPropertyDocuments(prop.id, 'reject')}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ✕ Flag Defect / Reject
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            )}
        </section>
      </main>
      {showReportModal && (
        <ReportViewerModal
          title="Property Law Consultations & Client Case Docket"
          subtitle={`Official legal consultation registry and case schedule for Attorney / Legal Counsel ${user.name} (${user.email}).`}
          reportCode={`KNW-LEGAL-DOCKET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
          data={appointments}
          columns={[
            { key: 'id', label: 'Appt #', width: '70px' },
            {
              key: 'customer_name',
              label: 'Client Contact',
              render: (val, row) => (
                <div>
                  <strong>{val}</strong>
                  <br />
                  <small style={{ color: '#64748b' }}>{row.customer_email}</small>
                </div>
              ),
            },
            {
              key: 'topic',
              label: 'Consultation Subject',
              render: val => <strong>{val}</strong>,
            },
            {
              key: 'appointment_date',
              label: 'Scheduled Session',
              render: (val, row) => `${new Date(val).toLocaleDateString('en-GB')} at ${row.start_time}`,
            },
            {
              key: 'status',
              label: 'Status',
              render: val => {
                const cls =
                  val === 'confirmed'
                    ? 'report-badge--green'
                    : val === 'rejected'
                    ? 'report-badge--red'
                    : 'report-badge--yellow'
                return <span className={`report-badge ${cls}`}>{val}</span>
              },
            },
            {
              key: 'message',
              label: 'Client Case Brief',
              render: val => (
                <span style={{ fontSize: '0.74rem', color: '#475569' }}>
                  {val ? (val.length > 55 ? val.slice(0, 55) + '...' : val) : '-'}
                </span>
              ),
            },
            {
              key: 'lawyer_note',
              label: 'Attorney Notes / Actions',
              render: val => (
                <span style={{ fontSize: '0.74rem', color: '#047857' }}>
                  {val || '-'}
                </span>
              ),
            },
          ]}
          kpis={[
            { label: 'Total Consultations', value: appointments.length, icon: '⚖️', sub: 'Booked docket' },
            { label: 'Confirmed Sessions', value: appointments.filter(a => a.status === 'confirmed').length, icon: '✓', sub: 'Active meetings' },
            { label: 'Pending Review', value: appointments.filter(a => a.status === 'pending').length, icon: '⏳', sub: 'Requires reply' },
            { label: 'Rescheduled / Closed', value: appointments.filter(a => ['rescheduled', 'completed', 'closed'].includes(a.status)).length, icon: '📁', sub: 'Historical' },
          ]}
          csvFilename={`knw_lawyer_consultations_${new Date().toISOString().slice(0, 10)}.csv`}
          onDownloadCSV={exportConsultationsCSV}
          onClose={() => setShowReportModal(false)}
          initialPrint={modalPrint}
        />
      )}
      <Footer onNavigate={onNavigate} />
    </div>
  )
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}

function formatTime(time) {
  return String(time || '').slice(0, 5)
}
