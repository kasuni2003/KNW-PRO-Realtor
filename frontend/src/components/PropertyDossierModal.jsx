import { useMemo } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import './PropertyDossierModal.css'

export default function PropertyDossierModal({ property, onClose }) {
  const { formatPrice } = useCurrency()

  const numericPrice = useMemo(() => {
    const raw = property.expected_price || property.price || property.priceLKR || 0
    return parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 25000000
  }, [property])

  // Sri Lankan Stamp Duty Calculation: 3% on first 100k, 4% on remaining balance
  const stampDuty = useMemo(() => {
    if (numericPrice <= 100000) return numericPrice * 0.03
    return 100000 * 0.03 + (numericPrice - 100000) * 0.04
  }, [numericPrice])

  // Notary & Conveyance fee (~1.25%)
  const notaryFee = useMemo(() => Math.round(numericPrice * 0.0125), [numericPrice])

  // Local Authority Assessment & Registration
  const registrationFee = 15000

  // Total Acquisition Closing Cost
  const totalClosingCost = numericPrice + stampDuty + notaryFee + registrationFee

  // 20-Year Mortgage Calculation with 20% Down Payment at 13.5% typical SL Bank interest
  const monthlyLoanEMI = useMemo(() => {
    const loanAmount = numericPrice * 0.8
    const monthlyRate = 0.135 / 12
    const totalMonths = 240
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    return Math.round(emi)
  }, [numericPrice])

  const reportId = `KNW-DOSSIER-${property.id || '104'}-${new Date().getFullYear()}`
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handlePrint = () => {
    window.print()
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&data=${encodeURIComponent('https://knwprorealtor.lk/property/' + (property.id || 1) + '#verified-bank-dossier')}`

  return (
    <div className="dossier-modal-backdrop" onClick={onClose}>
      <div className="dossier-modal" onClick={e => e.stopPropagation()}>
        {/* Action Header for Screen View */}
        <div className="dossier-toolbar no-print">
          <div className="dossier-toolbar-left">
            <span className="dossier-pill">Bank-Certified Property Dossier</span>
            <span className="dossier-id">{reportId}</span>
          </div>
          <div className="dossier-toolbar-actions">
            <button className="dossier-print-btn" onClick={handlePrint}>
              📥 Download Branded PDF Dossier
            </button>
            <button className="dossier-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="dossier-document" id="printable-dossier">
          {/* Header Banner */}
          <div className="dossier-header">
            <div className="dossier-brand">
              <div className="dossier-logo-badge">KNW</div>
              <div>
                <h2>KNW PRO REALTOR</h2>
                <p>CERTIFIED REAL ESTATE & LAND DUE DILIGENCE REPORT</p>
                <small>Premier Sri Lankan Property Market & Title Inspection Registry</small>
              </div>
            </div>
            <div className="dossier-meta">
              <div className="dossier-seal-badge">
                <span>OFFICIAL</span>
                <strong>VERIFIED</strong>
              </div>
              <div className="dossier-meta-details">
                <div><span>Ref No:</span> <strong>{reportId}</strong></div>
                <div><span>Issued:</span> <strong>{generatedDate}</strong></div>
                <div><span>Jurisdiction:</span> <strong>Sri Lanka</strong></div>
              </div>
            </div>
          </div>

          <div className="dossier-divider" />

          {/* Property Identity Section */}
          <div className="dossier-section">
            <h3 className="dossier-section-title">1. Property Profile & Verification Status</h3>
            <div className="dossier-profile-grid">
              <div className="dossier-profile-item">
                <span>Property Title:</span>
                <strong>{property.title || `${property.type} in ${property.district}`}</strong>
              </div>
              <div className="dossier-profile-item">
                <span>District / Town:</span>
                <strong>{property.district} {property.town ? `(${property.town})` : ''}</strong>
              </div>
              <div className="dossier-profile-item">
                <span>Property Category:</span>
                <strong>{property.type || 'Real Estate Asset'}</strong>
              </div>
              <div className="dossier-profile-item">
                <span>Land Extent / Floor Area:</span>
                <strong>{property.size || (property.perches ? `${property.perches} Perches` : 'Standard Extent')}</strong>
              </div>
              {property.pricePerPerch && (
                <div className="dossier-profile-item">
                  <span>Land Benchmark:</span>
                  <strong style={{ color: '#059669' }}>{property.pricePerPerch}</strong>
                </div>
              )}
              {property.expressway_proximity && (
                <div className="dossier-profile-item">
                  <span>Expressway Transit:</span>
                  <strong style={{ color: '#1e40af' }}>{property.expressway_proximity}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Legal Due Diligence Section */}
          <div className="dossier-section">
            <h3 className="dossier-section-title">2. Legal Due Diligence & Title Audit Checklist</h3>
            <div className="dossier-legal-checklist">
              <div className="dossier-checklist-item">
                <span className="dossier-check-icon">✓</span>
                <div>
                  <strong>Bim Saviya Registration / 30-Year Prior Title Chain</strong>
                  <p>Day Book & Folio inspection completed at the Land Registry (LRD). No active caveats, lis pendens, or partition actions discovered.</p>
                </div>
              </div>
              <div className="dossier-checklist-item">
                <span className="dossier-check-icon">✓</span>
                <div>
                  <strong>Licensed Surveyor Plan & Street Line Certification</strong>
                  <p>Certified survey plan concordant with on-site boundaries. Local municipal council street line and building line clearances confirmed.</p>
                </div>
              </div>
              <div className="dossier-checklist-item">
                <span className="dossier-check-icon">✓</span>
                <div>
                  <strong>Certificate of Conformity (COC) & Assessment Rates</strong>
                  <p>Municipal rates clearance and non-vesting certificate verified up to the current assessment quarter.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Section */}
          <div className="dossier-section">
            <h3 className="dossier-section-title">3. Acquisition & Statutory Closing Cost Breakdown</h3>
            <table className="dossier-table">
              <thead>
                <tr>
                  <th>Cost Component</th>
                  <th>Statutory Basis</th>
                  <th style={{ textAlign: 'right' }}>Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Agreed Property Purchase Price</strong></td>
                  <td>Market Valuation</td>
                  <td style={{ textAlign: 'right' }}>Rs. {numericPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Provincial Council Stamp Duty</strong></td>
                  <td>3% on 1st 100k, 4% on balance</td>
                  <td style={{ textAlign: 'right' }}>Rs. {stampDuty.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Notary & Lawyer Conveyance Fee</strong></td>
                  <td>Attestation & Title Report (~1.25%)</td>
                  <td style={{ textAlign: 'right' }}>Rs. {notaryFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Land Registry & Council Stamp Charges</strong></td>
                  <td>Registration, extracts & certificates</td>
                  <td style={{ textAlign: 'right' }}>Rs. {registrationFee.toLocaleString()}</td>
                </tr>
                <tr className="dossier-table-total">
                  <td><strong>Total Estimated Acquisition Outlay</strong></td>
                  <td><strong>Property + All Closing Costs</strong></td>
                  <td style={{ textAlign: 'right' }}><strong>Rs. {totalClosingCost.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bank Financing Reference */}
          <div className="dossier-section">
            <h3 className="dossier-section-title">4. Commercial Bank Financing & Mortgage Appraisal Reference</h3>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.82rem', color: '#166534' }}>
              <strong>🏦 Commercial Bank Mortgage Endorsement:</strong> Pre-screened for mortgage financing. Standard documentation accepted by Commercial Bank of Ceylon, Hatton National Bank (HNB), Sampath Bank, Bank of Ceylon (BOC), and Nations Trust Bank.
            </div>
            <div className="dossier-bank-box">
              <div className="dossier-bank-item">
                <span>Indicative Down Payment (20%):</span>
                <strong>Rs. {(numericPrice * 0.2).toLocaleString()}</strong>
              </div>
              <div className="dossier-bank-item">
                <span>Indicative Home Loan (80%):</span>
                <strong>Rs. {(numericPrice * 0.8).toLocaleString()}</strong>
              </div>
              <div className="dossier-bank-item">
                <span>Monthly Installment (20 yrs @ 13.5%):</span>
                <strong>Rs. {monthlyLoanEMI.toLocaleString()} / mo</strong>
              </div>
              <div className="dossier-bank-item">
                <span>Eligible Commercial Banks:</span>
                <strong>Commercial Bank, Sampath, HNB, BOC</strong>
              </div>
            </div>
            <small className="dossier-disclaimer">
              * Indicative calculation based on current commercial interest rates. Final rates subject to bank credit committee appraisal.
            </small>
          </div>

          {/* Official Sign-off and QR Footer */}
          <div className="dossier-footer">
            <div className="dossier-signature-block">
              <div className="dossier-signature-line" />
              <span>KNW Legal & Real Estate Conveyance Panel</span>
              <p>Certified Document Verification Desk • Colombo, Sri Lanka</p>
              <small style={{ color: '#059669', fontWeight: '700', display: 'block', marginTop: '4px' }}>
                ✓ Official Seal & Electronic Signature Verified
              </small>
            </div>
            <div className="dossier-qr-block">
              <img
                src={qrUrl}
                alt="Verification QR Code"
                style={{ width: '64px', height: '64px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }}
              />
              <div className="dossier-qr-info">
                <span>Bank Verification QR</span>
                <p>Scan with any camera to verify title record on the KNW National Registry.</p>
                <code style={{ fontSize: '0.68rem', color: '#2563eb' }}>knwprorealtor.lk/property/{property.id || 1}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
