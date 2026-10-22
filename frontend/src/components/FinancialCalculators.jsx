import { useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import './FinancialCalculators.css'

export default function FinancialCalculators({ initialPrice = 25000000, onClose }) {
  const { currency, formatPrice } = useCurrency()
  const [activeTab, setActiveTab] = useState('stampDuty') // 'stampDuty' | 'mortgage'

  // ── Stamp Duty State ──
  const [propertyPrice, setPropertyPrice] = useState(initialPrice)
  const [propertyType, setPropertyType] = useState('residential') // 'residential' | 'land' | 'commercial'
  const [buyerType, setBuyerType] = useState('local') // 'local' | 'foreign'

  // Stamp Duty Math (Sri Lanka):
  // 3% for the first Rs. 100,000 and 4% for the remainder
  const calculateStampDuty = (price) => {
    if (price <= 0) return 0
    if (price <= 100000) return price * 0.03
    return 100000 * 0.03 + (price - 100000) * 0.04
  }

  const stampDutyAmount = calculateStampDuty(propertyPrice)
  const lawyerFee = propertyPrice * 0.015 // ~1.5% typical notary fee
  const landRegistryFee = Math.min(propertyPrice * 0.002, 50000) // approx 0.2% max 50k
  const titleSearchFee = 25000 // Average 30-year deed chain search
  const totalClosingCost = stampDutyAmount + lawyerFee + landRegistryFee + titleSearchFee
  const totalWithProperty = propertyPrice + totalClosingCost

  // ── Mortgage / Loan EMI State ──
  const [loanPrice, setLoanPrice] = useState(initialPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(12.5) // Current SL commercial bank benchmark
  const [tenureYears, setTenureYears] = useState(15)

  const downPaymentAmount = loanPrice * (downPaymentPercent / 100)
  const loanPrincipal = loanPrice - downPaymentAmount
  const monthlyRate = interestRate / 100 / 12
  const totalMonths = tenureYears * 12

  const monthlyEMI =
    loanPrincipal > 0 && monthlyRate > 0
      ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0

  const totalRepayment = monthlyEMI * totalMonths
  const totalInterest = totalRepayment - loanPrincipal

  // Bank benchmark rates in Sri Lanka
  const bankBenchmarks = [
    { bank: 'Commercial Bank', rate: '11.75% - 12.50%', tag: 'Competitive' },
    { bank: 'Hatton National Bank (HNB)', rate: '12.00% - 13.00%', tag: 'Fast Approval' },
    { bank: 'Sampath Bank', rate: '12.25% - 13.25%', tag: 'Flexible Terms' },
    { bank: 'Bank of Ceylon (BOC)', rate: '11.50% - 12.25%', tag: 'Government Bank' },
  ]

  return (
    <div className="calc-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="calc-modal">
        {/* Header */}
        <div className="calc-header">
          <div className="calc-header-title">
            <div className="calc-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
                <path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" />
                <path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" />
              </svg>
            </div>
            <div>
              <h3>Sri Lanka Property Financial Calculators</h3>
              <p>Transparent fee estimates and mortgage planning in {currency}</p>
            </div>
          </div>
          {onClose && (
            <button className="calc-close-btn" onClick={onClose} aria-label="Close">
              &times;
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="calc-tabs">
          <button
            className={`calc-tab-btn ${activeTab === 'stampDuty' ? 'active' : ''}`}
            onClick={() => setActiveTab('stampDuty')}
          >
            🏛️ Stamp Duty & Closing Costs
          </button>
          <button
            className={`calc-tab-btn ${activeTab === 'mortgage' ? 'active' : ''}`}
            onClick={() => setActiveTab('mortgage')}
          >
            🏡 Mortgage / Home Loan EMI
          </button>
        </div>

        {/* Content */}
        <div className="calc-body">
          {activeTab === 'stampDuty' ? (
            <div className="calc-grid">
              {/* Inputs */}
              <div className="calc-inputs">
                <label className="calc-label">
                  Property Value ({currency})
                  <input
                    type="number"
                    className="calc-input"
                    value={propertyPrice}
                    step="500000"
                    onChange={e => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                  />
                  <span className="calc-hint">Approx: {formatPrice(propertyPrice)}</span>
                </label>

                <div className="calc-row">
                  <label className="calc-label">
                    Property Type
                    <select
                      className="calc-input"
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                    >
                      <option value="residential">Residential House / Villa</option>
                      <option value="land">Bare Land</option>
                      <option value="commercial">Commercial / Apartment</option>
                    </select>
                  </label>
                  <label className="calc-label">
                    Buyer Status
                    <select
                      className="calc-input"
                      value={buyerType}
                      onChange={e => setBuyerType(e.target.value)}
                    >
                      <option value="local">Sri Lankan Citizen / Dual Citizen</option>
                      <option value="foreign">Foreign National / Non-Citizen</option>
                    </select>
                  </label>
                </div>

                {buyerType === 'foreign' && (
                  <div className="calc-foreign-warning">
                    ⚠️ <strong>Notice for Foreign Buyers:</strong> Under the Land Restrictions Act, non-citizens can buy apartments on or above the 4th floor or lease land for up to 99 years. Consult our certified property lawyers before executing transfers.
                  </div>
                )}

                <div className="calc-info-card">
                  <h4>💡 Sri Lanka Legal Framework:</h4>
                  <ul>
                    <li>Stamp Duty: 3% on first Rs. 100,000 + 4% on remaining balance.</li>
                    <li>Notary Fee: Standard professional bar council rate ~1% to 1.5%.</li>
                    <li>Land Registry & Folio Search: Required for 30-year deed chain clear title verification.</li>
                  </ul>
                </div>
              </div>

              {/* Output Results */}
              <div className="calc-results">
                <h4>Closing Cost Breakdown</h4>
                <div className="calc-breakdown-item">
                  <span>Provincial Council Stamp Duty (3% - 4%)</span>
                  <strong>{formatPrice(stampDutyAmount)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Notary / Conveyancing Lawyer (~1.5%)</span>
                  <strong>{formatPrice(lawyerFee)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Land Registry Registration Fee (~0.2%)</span>
                  <strong>{formatPrice(landRegistryFee)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>30-Year Title Search & Documentation</span>
                  <strong>{formatPrice(titleSearchFee)}</strong>
                </div>

                <div className="calc-divider" />

                <div className="calc-breakdown-item highlight">
                  <span>Total Estimated Closing Costs</span>
                  <span className="calc-price-large">{formatPrice(totalClosingCost)}</span>
                </div>
                <p className="calc-percent-badge">
                  Adds approx {((totalClosingCost / (propertyPrice || 1)) * 100).toFixed(1)}% to your purchase price
                </p>

                <div className="calc-total-box">
                  <span>Total Funds Required</span>
                  <h3>{formatPrice(totalWithProperty)}</h3>
                  <small>Property Price + Legal & Stamp Costs</small>
                </div>
              </div>
            </div>
          ) : (
            <div className="calc-grid">
              {/* Mortgage Inputs */}
              <div className="calc-inputs">
                <label className="calc-label">
                  Property Price ({currency})
                  <input
                    type="number"
                    className="calc-input"
                    value={loanPrice}
                    step="500000"
                    onChange={e => setLoanPrice(Math.max(0, Number(e.target.value)))}
                  />
                  <span className="calc-hint">Approx: {formatPrice(loanPrice)}</span>
                </label>

                <div className="calc-slider-group">
                  <div className="calc-slider-header">
                    <span>Down Payment: {downPaymentPercent}%</span>
                    <strong>{formatPrice(downPaymentAmount)}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={downPaymentPercent}
                    onChange={e => setDownPaymentPercent(Number(e.target.value))}
                  />
                </div>

                <div className="calc-slider-group">
                  <div className="calc-slider-header">
                    <span>Interest Rate: {interestRate}% per annum</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    step="0.25"
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                  />
                </div>

                <div className="calc-slider-group">
                  <div className="calc-slider-header">
                    <span>Loan Duration: {tenureYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={tenureYears}
                    onChange={e => setTenureYears(Number(e.target.value))}
                  />
                </div>

                {/* Bank benchmarks */}
                <div className="calc-banks-box">
                  <h5>Current Sri Lankan Bank Interest Benchmarks:</h5>
                  <div className="calc-banks-list">
                    {bankBenchmarks.map((b, i) => (
                      <div key={i} className="calc-bank-item">
                        <span>{b.bank}</span>
                        <strong>{b.rate}</strong>
                        <em>{b.tag}</em>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mortgage Results */}
              <div className="calc-results">
                <h4>Loan Summary</h4>
                <div className="calc-emi-hero">
                  <span>Estimated Monthly Payment</span>
                  <div className="calc-emi-amount">{formatPrice(monthlyEMI)}</div>
                  <small>per month for {tenureYears} years ({totalMonths} installments)</small>
                </div>

                <div className="calc-breakdown-item">
                  <span>Loan Principal Amount</span>
                  <strong>{formatPrice(loanPrincipal)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Down Payment ({downPaymentPercent}%)</span>
                  <strong>{formatPrice(downPaymentAmount)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Total Interest Payable</span>
                  <strong style={{ color: '#D97706' }}>{formatPrice(totalInterest)}</strong>
                </div>
                <div className="calc-breakdown-item highlight">
                  <span>Total Amount Repaid</span>
                  <strong>{formatPrice(totalRepayment)}</strong>
                </div>

                <div className="calc-bar-wrap">
                  <div
                    className="calc-bar-principal"
                    style={{ width: `${(loanPrincipal / (totalRepayment || 1)) * 100}%` }}
                    title="Principal"
                  />
                  <div
                    className="calc-bar-interest"
                    style={{ width: `${(totalInterest / (totalRepayment || 1)) * 100}%` }}
                    title="Interest"
                  />
                </div>
                <div className="calc-bar-legend">
                  <span><span className="dot dot-principal" /> Principal ({((loanPrincipal / (totalRepayment || 1)) * 100).toFixed(0)}%)</span>
                  <span><span className="dot dot-interest" /> Interest ({((totalInterest / (totalRepayment || 1)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
