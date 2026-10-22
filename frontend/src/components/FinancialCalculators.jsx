import { useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { useSystemSettings } from '../context/SystemSettingsContext'
import './FinancialCalculators.css'

export default function FinancialCalculators({ initialPrice = 25000000, onClose }) {
  const { currency, formatPrice } = useCurrency()
  const { settings } = useSystemSettings()
  const [activeTab, setActiveTab] = useState('stampDuty') // 'stampDuty' | 'mortgage'

  const legalSettings = settings?.legal_closing_fees || {}
  const mortgageSettings = settings?.mortgage_benchmarks || {}

  const stampThreshold = Number(legalSettings.stamp_duty_threshold ?? 100000)
  const tier1Rate = Number(legalSettings.stamp_duty_tier1_rate ?? 3.0) / 100
  const tier2Rate = Number(legalSettings.stamp_duty_tier2_rate ?? 4.0) / 100
  const lawyerRate = Number(legalSettings.lawyer_notary_rate ?? 1.5) / 100
  const registryRate = Number(legalSettings.land_registry_rate ?? 0.2) / 100
  const registryCap = Number(legalSettings.land_registry_cap ?? 50000)
  const titleSearchFee = Number(legalSettings.title_search_fee ?? 25000)

  // ── Stamp Duty State ──
  const [propertyPrice, setPropertyPrice] = useState(initialPrice)
  const [propertyType, setPropertyType] = useState('residential') // 'residential' | 'land' | 'commercial'
  const [buyerType, setBuyerType] = useState('local') // 'local' | 'foreign'

  // Dynamic Stamp Duty Math:
  const calculateStampDuty = (price) => {
    if (price <= 0) return 0
    if (price <= stampThreshold) return price * tier1Rate
    return stampThreshold * tier1Rate + (price - stampThreshold) * tier2Rate
  }

  const stampDutyAmount = calculateStampDuty(propertyPrice)
  const lawyerFee = propertyPrice * lawyerRate
  const landRegistryFee = Math.min(propertyPrice * registryRate, registryCap)
  const totalClosingCost = stampDutyAmount + lawyerFee + landRegistryFee + titleSearchFee
  const totalWithProperty = propertyPrice + totalClosingCost

  // ── Mortgage / Loan EMI State ──
  const [loanPrice, setLoanPrice] = useState(initialPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(Number(mortgageSettings.default_down_payment_pct ?? 20))
  const [interestRate, setInterestRate] = useState(Number(mortgageSettings.benchmark_interest_rate ?? 12.5))
  const [tenureYears, setTenureYears] = useState(Number(mortgageSettings.default_tenure_years ?? 15))

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

  const bankBenchmarks = mortgageSettings.bank_rates || [
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
                    <li>Stamp Duty: {legalSettings.stamp_duty_tier1_rate ?? 3}% on first Rs. {stampThreshold.toLocaleString()} + {legalSettings.stamp_duty_tier2_rate ?? 4}% on remaining balance.</li>
                    <li>Notary Fee: Standard professional conveyance rate ~{legalSettings.lawyer_notary_rate ?? 1.5}%.</li>
                    <li>Land Registry & Folio Search: {legalSettings.land_registry_rate ?? 0.2}% (capped at Rs. {registryCap.toLocaleString()}) for 30-year deed chain clear title verification.</li>
                  </ul>
                </div>
              </div>

              {/* Output Results */}
              <div className="calc-results">
                <h4>Closing Cost Breakdown</h4>
                <div className="calc-breakdown-item">
                  <span>Provincial Council Stamp Duty</span>
                  <strong>{formatPrice(stampDutyAmount)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Notary / Conveyancing Lawyer (~{legalSettings.lawyer_notary_rate ?? 1.5}%)</span>
                  <strong>{formatPrice(lawyerFee)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Land Registry Registration Fee (~{legalSettings.land_registry_rate ?? 0.2}%)</span>
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
                    max="22"
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
                    max="30"
                    step="1"
                    value={tenureYears}
                    onChange={e => setTenureYears(Number(e.target.value))}
                  />
                </div>

                {/* Bank Reference Table */}
                <div className="calc-banks-box">
                  <h4>Live Sri Lanka Bank Benchmarks:</h4>
                  <div className="calc-banks-list">
                    {bankBenchmarks.map(b => (
                      <div key={b.bank} className="calc-bank-item">
                        <div>
                          <strong>{b.bank}</strong>
                          <span className="calc-bank-tag">{b.tag}</span>
                        </div>
                        <span className="calc-bank-rate">{b.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mortgage Results */}
              <div className="calc-results">
                <h4>Loan Repayment Summary</h4>
                <div className="calc-emi-card">
                  <span>Estimated Monthly Payment (EMI)</span>
                  <div className="calc-emi-val">{formatPrice(Math.round(monthlyEMI))}<small>/mo</small></div>
                  <p>Based on {tenureYears} years fixed amortisation schedule</p>
                </div>

                <div className="calc-breakdown-item">
                  <span>Principal Loan Borrowed</span>
                  <strong>{formatPrice(loanPrincipal)}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Total Interest Payable</span>
                  <strong style={{ color: '#dc2626' }}>{formatPrice(Math.round(totalInterest))}</strong>
                </div>
                <div className="calc-breakdown-item">
                  <span>Total Amount to Pay</span>
                  <strong>{formatPrice(Math.round(totalRepayment))}</strong>
                </div>

                <div className="calc-divider" />

                <div className="calc-loan-visual">
                  <div className="calc-bar-wrap">
                    <div
                      className="calc-bar principal"
                      style={{ width: `${(loanPrincipal / (totalRepayment || 1)) * 100}%` }}
                      title="Principal"
                    />
                    <div
                      className="calc-bar interest"
                      style={{ width: `${(totalInterest / (totalRepayment || 1)) * 100}%` }}
                      title="Interest"
                    />
                  </div>
                  <div className="calc-bar-legend">
                    <span className="legend-p">■ Principal: {((loanPrincipal / (totalRepayment || 1)) * 100).toFixed(0)}%</span>
                    <span className="legend-i">■ Interest: {((totalInterest / (totalRepayment || 1)) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
