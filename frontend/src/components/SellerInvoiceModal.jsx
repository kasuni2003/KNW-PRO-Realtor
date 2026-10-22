import React from 'react'
import './SellerInvoiceModal.css'

export default function SellerInvoiceModal({ payment, user, onClose }) {
  if (!payment) return null

  const invoiceNumber = `KNW-INV-${String(payment.id || 1).padStart(5, '0')}`
  const invoiceDate = payment.paid_at
    ? new Date(payment.paid_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date(payment.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const amount = Number(payment.amount || 0)
  // VAT in Sri Lanka is 18% inclusive in official retail listing prices
  const netAmount = amount / 1.18
  const vatAmount = amount - netAmount

  const planName = payment.plan
    ? `${payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Tier Listing`
    : 'Standard Real Estate Listing'

  return (
    <div className="seller-invoice-backdrop" onClick={onClose}>
      <div className="seller-invoice-modal" onClick={e => e.stopPropagation()}>
        <div className="seller-invoice-actions-bar">
          <h3>🧾 Official Tax Receipt & Invoice</h3>
          <div className="seller-invoice-btns">
            <button type="button" className="btn-invoice-print" onClick={() => window.print()}>
              🖨️ Print / Save PDF
            </button>
            <button type="button" className="btn-invoice-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        <div className="seller-invoice-paper">
          {/* Brand Row */}
          <div className="invoice-brand-row">
            <div>
              <div className="invoice-logo-title">
                KNW <span>PRO</span> REALTOR
              </div>
              <div className="invoice-company-sub">
                KNW PRO REALTOR (PVT) LTD · Registration No: PV-00249108<br />
                TIN: 10482910-7000 · VAT Reg: 10482910-7000-0001<br />
                452 Galle Road, Colombo 03, Western Province, Sri Lanka<br />
                Hotline: +94 11 234 5678 · billing@knwprorealtor.lk
              </div>
            </div>
            <div className="invoice-title-block">
              <h2>TAX INVOICE</h2>
              <div className="invoice-number-tag">{invoiceNumber}</div>
            </div>
          </div>

          {/* Meta Details */}
          <div className="invoice-meta-grid">
            <div className="invoice-meta-col">
              <h4>Billed To</h4>
              <p><strong>{user?.name || 'Registered Seller'}</strong></p>
              <p>Email: {user?.email || 'N/A'}</p>
              <p>Phone: {user?.phone || 'On file'}</p>
              <p>Account Type: Certified Property Seller</p>
            </div>
            <div className="invoice-meta-col">
              <h4>Payment Summary</h4>
              <p><strong>Invoice Date:</strong> {invoiceDate}</p>
              <p><strong>Order ID:</strong> {payment.order_id || 'N/A'}</p>
              <p><strong>Payment Channel:</strong> {payment.provider ? payment.provider.toUpperCase() : 'DIRECT'}</p>
              <p><strong>Transaction Ref:</strong> {payment.payment_reference || 'Ref Verified'}</p>
            </div>
          </div>

          {/* Property Context */}
          {payment.property && (
            <div style={{ marginBottom: '16px', background: '#eff6ff', padding: '10px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#1e40af' }}>
              <strong>Target Listing:</strong> {payment.property.property_type} in {payment.property.district} {payment.property.expected_price ? `(Listed at ${payment.property.expected_price})` : ''}
            </div>
          )}

          {/* Itemized Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item & Description</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                <th className="text-right" style={{ width: '130px' }}>Unit Net (LKR)</th>
                <th className="text-right" style={{ width: '130px' }}>Total (LKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{planName} - Publication & Deed Verification Fee</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Listing placement, AI valuation indexing, verified legal watermark, and lead routing.
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td className="text-right">
                  {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="text-right">
                  {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="invoice-totals-wrap">
            <div className="invoice-totals-box">
              <div className="invoice-total-row">
                <span>Subtotal (Net):</span>
                <span>Rs. {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="invoice-total-row">
                <span>VAT (18%):</span>
                <span>Rs. {vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="invoice-total-row invoice-total-row--grand">
                <span>Total Paid:</span>
                <span>Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Stamp & Footer */}
          <div className="invoice-footer-row">
            <div>
              <div className="invoice-stamp">
                ✓ {payment.status === 'completed' || payment.status === 'approved' ? 'PAYMENT COMPLETED' : (payment.status || 'PAID').toUpperCase()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                Electronic confirmation generated on {invoiceDate}
              </div>
            </div>
            <div className="invoice-legal-note">
              This is a system-generated official electronic invoice issued under the Electronic Transactions Act No. 19 of 2006 of the Democratic Socialist Republic of Sri Lanka. Retain this invoice for income tax and capital gains filing records.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
