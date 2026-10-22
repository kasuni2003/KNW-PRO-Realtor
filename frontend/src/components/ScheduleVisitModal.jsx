import React, { useState } from 'react'
import axios from 'axios'
import { downloadCalendarInvite } from '../utils/calendarInvite'
import './ScheduleVisitModal.css'

export default function ScheduleVisitModal({ property, user, onClose, onSuccess }) {
  const [visitDate, setVisitDate] = useState(() => {
    // Default to tomorrow
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [visitSlot, setVisitSlot] = useState('Morning (09:00 AM – 12:00 PM)')
  const [buyerName, setBuyerName] = useState(user?.name || '')
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '')
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmedData, setConfirmedData] = useState(null)

  const slots = [
    { id: 'Morning (09:00 AM – 12:00 PM)', label: '🌅 Morning', time: '09:00 - 12:00' },
    { id: 'Afternoon (01:00 PM – 04:00 PM)', label: '☀️ Afternoon', time: '13:00 - 16:00' },
    { id: 'Evening (04:00 PM – 06:00 PM)', label: '🌇 Evening', time: '16:00 - 18:00' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        buyer_id: user?.id || null,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        visit_date: visitDate,
        visit_slot: visitSlot,
        message: notes,
      }

      const res = await axios.post(`/api/properties/${property.id}/site-visits`, payload)
      setConfirmedData(res.data.data)
      if (onSuccess) onSuccess(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule site visit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadIcs = () => {
    downloadCalendarInvite({
      title: `Site Inspection: ${property.title || property.property_type}`,
      description: `Physical site inspection arranged via KNW PRO Realtor.\nProperty: ${property.title || property.property_type} in ${property.district}\nListed Price: ${property.expected_price || property.price}\nNotes: ${notes || 'Standard physical viewing'}`,
      location: `${property.district}, Sri Lanka`,
      startDate: visitDate,
      timeSlot: visitSlot,
      contactName: property.seller?.name || property.seller_name || 'Seller Desk',
      contactPhone: property.contact_number || property.seller?.phone || '+94 77 123 4567',
    })
  }

  const cleanPhone = String(property.contact_number || property.seller?.phone || '94771234567').replace(/[^0-9]/g, '')
  const whatsappText = `Hello! I have requested a physical site inspection for Property #${property.id} (${property.title || property.property_type} in ${property.district}) on ${visitDate} (${visitSlot}) via KNW PRO Realtor.`
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`

  return (
    <div className="visit-modal-backdrop" onClick={onClose}>
      <div className="visit-modal" onClick={e => e.stopPropagation()}>
        <div className="visit-modal-header">
          <h3>📅 Book Physical Site Inspection</h3>
          <button type="button" className="visit-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="visit-modal-body">
          {confirmedData ? (
            <div className="visit-success-card">
              <div className="visit-success-icon">🎉</div>
              <h4>Site Inspection Requested!</h4>
              <p>
                Your on-site inspection request has been transmitted directly to the verified seller and logged in your Buyer Dashboard.
              </p>

              <div className="visit-confirmed-details">
                <div><strong>Property:</strong> {property.title || property.property_type}</div>
                <div><strong>Location:</strong> {property.district}</div>
                <div><strong>Scheduled Date:</strong> {visitDate}</div>
                <div><strong>Preferred Window:</strong> {visitSlot}</div>
                <div><strong>Seller Contact:</strong> {property.seller?.name || 'Verified Seller'} ({property.contact_number || property.seller?.phone || 'Direct'})</div>
              </div>

              <div className="visit-success-actions">
                <button type="button" className="btn-ics-download" onClick={handleDownloadIcs}>
                  📅 Add to Calendar (.ICS Invite)
                </button>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp-visit">
                  💬 Send WhatsApp Message to Seller
                </a>
                <button
                  type="button"
                  className="btn-white"
                  style={{ marginTop: '6px', padding: '9px', border: '1px solid #cbd5e1', cursor: 'pointer', borderRadius: '6px' }}
                  onClick={onClose}
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="visit-prop-preview">
                {property.image_url ? (
                  <img src={property.image_url} alt="Property" className="visit-prop-thumb" />
                ) : (
                  <div className="visit-prop-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏡</div>
                )}
                <div className="visit-prop-info">
                  <strong>{property.title || `${property.property_type} in ${property.district}`}</strong>
                  <span>{property.district} · {property.expected_price || property.price}</span>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <div className="visit-form-group">
                <label>Select Preferred Inspection Date</label>
                <input
                  type="date"
                  value={visitDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setVisitDate(e.target.value)}
                  required
                />
              </div>

              <div className="visit-form-group">
                <label>Select Arrival Time Slot</label>
                <div className="visit-slot-grid">
                  {slots.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`visit-slot-btn ${visitSlot === s.id ? 'visit-slot-btn--active' : ''}`}
                      onClick={() => setVisitSlot(s.id)}
                    >
                      <span>{s.label}</span>
                      <small style={{ fontSize: '0.7rem' }}>{s.time}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="visit-form-group">
                  <label>Your Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="e.g. Ruwan Perera"
                    required
                  />
                </div>
                <div className="visit-form-group">
                  <label>WhatsApp Contact Number</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="visit-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  placeholder="ruwan@example.com"
                  required
                />
              </div>

              <div className="visit-form-group">
                <label>Inspection Notes / Special Requests (Optional)</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Please arrange access to boundary stones / motor room / survey plan copy."
                />
              </div>

              <button type="submit" className="visit-submit-btn" disabled={submitting}>
                {submitting ? 'Confirming Visit...' : '📅 Confirm Physical Inspection Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
