import { useState } from 'react'
import './DocumentWatermarkViewer.css'

export default function DocumentWatermarkViewer({
  property,
  user,
  onNavigate,
}) {
  const [selectedDoc, setSelectedDoc] = useState(null)

  const rawDocs = property?.documents || []
  const docList = rawDocs.map(d => typeof d === 'string' ? { name: d, is_cleared: Boolean(property?.is_deed_verified) } : d)

  const isDeedVerified = Boolean(property?.is_deed_verified)
  const legalStatus = property?.legal_status || (isDeedVerified ? 'approved' : 'no_documents')
  const verifierName = property?.deed_verifier_name || 'KNW Certified Panel Attorney'

  const handleOpenDoc = (doc) => {
    if (!user) {
      if (onNavigate) {
        onNavigate('login')
      } else {
        window.location.href = '/login'
      }
      return
    }
    setSelectedDoc(doc)
  }

  if (!isDeedVerified && docList.length === 0) {
    return (
      <section className="watermark-doc-section" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>⚖️</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>
              Legal Title Documents: Not Yet Cleared by Lawyer
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              The seller has not yet submitted title deeds or survey plans for KNW panel attorney clearance. For complete legal peace of mind, buyers are advised to book a legal consultation with our verified property lawyers before paying advances.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '10px 18px', fontSize: '13px' }}
            onClick={() => onNavigate ? onNavigate('legal') : (window.location.href = '/legal')}
          >
            ⚖️ Consult Property Lawyer
          </button>
        </div>
      </section>
    )
  }

  if (!isDeedVerified && docList.length > 0) {
    return (
      <section className="watermark-doc-section" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ fontSize: '28px' }}>⏳</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#b45309', letterSpacing: '0.5px' }}>
              Legal Due Diligence in Progress
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#92400e', margin: '4px 0 8px 0' }}>
              Documents Submitted — Awaiting Lawyer Clearance
            </h3>
            <p style={{ fontSize: '14px', color: '#b45309', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              The seller has submitted {docList.length} legal document(s) (Title Deeds / Survey Plan). Our certified panel attorneys are currently performing Land Registry folio searches and local authority due diligence before certifying this title.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {docList.map((d, i) => (
                <span key={i} style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  📄 {d.name || d} (Inspection Pending)
                </span>
              ))}
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ background: '#d97706', whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '13px' }}
            onClick={() => onNavigate ? onNavigate('legal') : (window.location.href = '/legal')}
          >
            ⚖️ Inquire with Lawyer
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="watermark-doc-section">
      <div className="watermark-doc-header">
        <div>
          <span className="watermark-kicker">🛡️ Verified by {verifierName}</span>
          <h2 className="watermark-title">Verified Legal Documents & Survey Plans</h2>
          <p className="watermark-subtitle">
            All deeds, survey plans, and municipal clearances have been verified clear from encumbrances and stamped with tamper-proof KNW PRO REALTOR watermarks.
          </p>
        </div>
        <div className="watermark-badge-pill">
          🔒 Watermark Protected Preview
        </div>
      </div>

      <div className="watermark-doc-grid">
        {docList.map((doc, idx) => (
          <div key={idx} className="watermark-doc-card" onClick={() => handleOpenDoc(doc.name || doc)}>
            <div className="watermark-doc-thumb">
              <div className="watermark-doc-icon">📄</div>
              <div className="watermark-mini-stamp">LAWYER CLEARED</div>
            </div>
            <div className="watermark-doc-info">
              <strong>{doc.name || doc}</strong>
              <span>
                {user ? 'Click to inspect watermarked preview' : '🔒 Sign in to inspect protected preview'}
              </span>
            </div>
            <button className="watermark-doc-btn">
              {user ? 'Preview with Watermark' : 'Sign in to View'}
            </button>
          </div>
        ))}
      </div>

      {!user && (
        <div className="watermark-guest-notice">
          <p>
            🛡️ <strong>Seller Privacy & Anti-Theft Policy:</strong> Document inspection is strictly restricted to signed-in members.
          </p>
          <button className="btn-primary watermark-login-btn" onClick={() => onNavigate ? onNavigate('login') : (window.location.href = '/login')}>
            Sign In / Register to Inspect Documents
          </button>
        </div>
      )}

      {selectedDoc && (
        <div className="watermark-modal-backdrop" onClick={() => setSelectedDoc(null)}>
          <div className="watermark-modal" onClick={e => e.stopPropagation()}>
            <div className="watermark-modal-header">
              <div>
                <span className="watermark-modal-tag">OFFICIAL KNW CERTIFIED PREVIEW</span>
                <h3>{selectedDoc}</h3>
                <p>Property #{property.id} • {property.title || property.type} • {property.district}</p>
              </div>
              <button className="watermark-modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div className="watermark-canvas-container">
              {/* Repeating diagonal watermark grid */}
              <div className="watermark-overlay-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="watermark-text-row">
                    <span>VERIFIED PREVIEW • KNW PRO REALTOR • DO NOT COPY • PROPERTY #{property.id}</span>
                  </div>
                ))}
              </div>

              {/* Document Mock Sheet */}
              <div className="watermark-mock-sheet">
                <div className="watermark-sheet-header">
                  <div className="watermark-seal">
                    <div className="watermark-seal-inner">
                      <span>KNW</span>
                      <small>VERIFIED</small>
                    </div>
                  </div>
                  <div>
                    <h4>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</h4>
                    <h5>LAND REGISTRY & CERTIFIED SURVEY INSPECTION RECORD</h5>
                    <p>Registration Division: {property.district || 'Western Province'}</p>
                  </div>
                </div>

                <div className="watermark-sheet-body">
                  <div className="sheet-row">
                    <span className="sheet-label">Document Type:</span>
                    <span className="sheet-value">{selectedDoc}</span>
                  </div>
                  <div className="sheet-row">
                    <span className="sheet-label">Registered Property:</span>
                    <span className="sheet-value">KNW-PROP-{property.id} ({property.type} in {property.district})</span>
                  </div>
                  <div className="sheet-row">
                    <span className="sheet-label">Status:</span>
                    <span className="sheet-value sheet-verified">✓ Title Deed Chain & Land Records Checked</span>
                  </div>
                  <div className="sheet-row">
                    <span className="sheet-label">Watermark Security:</span>
                    <span className="sheet-value">VERIFIED PREVIEW - KNW PRO REALTOR (Protected against unauthorized broker distribution)</span>
                  </div>
                  <div className="watermark-sheet-diagram">
                    <div className="diagram-box">
                      <span>[ CERTIFIED SURVEY BOUNDARY & DEED EXTRACT ]</span>
                      <p>Extent: Verified as per seller declaration • Tap water & 20ft road frontage verified</p>
                    </div>
                  </div>
                </div>

                <div className="watermark-sheet-footer">
                  <span>Protected Document ID: KNW-SEC-947{property.id}</span>
                  <span>Digitally Stamped for {user?.name || 'Authorized Member'}</span>
                </div>
              </div>
            </div>

            <div className="watermark-modal-footer">
              <span className="watermark-notice-text">
                ⚠️ This preview is protected by intellectual property laws. Reproduction, download without authorization, or external distribution is strictly prohibited.
              </span>
              <button className="btn-primary" onClick={() => setSelectedDoc(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
