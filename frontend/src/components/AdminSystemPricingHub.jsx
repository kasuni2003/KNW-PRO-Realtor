import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSystemSettings } from '../context/SystemSettingsContext'
import './AdminSystemPricingHub.css'

export default function AdminSystemPricingHub() {
  const { settings, refreshSettings } = useSystemSettings()
  const [activeTab, setActiveTab] = useState('legal') // 'legal' | 'mortgage' | 'valuation' | 'seller' | 'currency'
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' })

  // Form states initialized from settings
  const [legal, setLegal] = useState({
    stamp_duty_threshold: 100000,
    stamp_duty_tier1_rate: 3.0,
    stamp_duty_tier2_rate: 4.0,
    lawyer_notary_rate: 1.5,
    land_registry_rate: 0.2,
    land_registry_cap: 50000,
    title_search_fee: 25000,
  })

  const [mortgage, setMortgage] = useState({
    benchmark_interest_rate: 12.5,
    default_down_payment_pct: 20,
    default_tenure_years: 15,
    bank_rates: [],
  })

  const [valuation, setValuation] = useState({
    districts: {},
    road_factors: { '20ft': 1.08, '15ft': 1.0, '10ft': 0.88 },
    construction_sqft_costs: { modern: 8500, standard: 5500 },
  })
  const [selectedDistrict, setSelectedDistrict] = useState('Colombo')
  const [newDistrictName, setNewDistrictName] = useState('')
  const [showAddDistrict, setShowAddDistrict] = useState(false)

  const [seller, setSeller] = useState({
    listing_plans: [],
    lawyer_consultation_default_fee: 5000,
    platform_commission_pct: 25,
  })

  const [currencies, setCurrencies] = useState({})

  // Sync state when settings are loaded or changed
  useEffect(() => {
    if (settings) {
      if (settings.legal_closing_fees) setLegal({ ...settings.legal_closing_fees })
      if (settings.mortgage_benchmarks) setMortgage({ ...settings.mortgage_benchmarks })
      if (settings.valuation_parameters) {
        setValuation({ ...settings.valuation_parameters })
        const dists = Object.keys(settings.valuation_parameters.districts || {})
        if (dists.length > 0 && !settings.valuation_parameters.districts[selectedDistrict]) {
          setSelectedDistrict(dists[0])
        }
      }
      if (settings.seller_packages) setSeller({ ...settings.seller_packages })
      if (settings.currency_rates) setCurrencies({ ...settings.currency_rates })
    }
  }, [settings])

  const showNotification = (text, type = 'success') => {
    setStatusMsg({ text, type })
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 6000)
  }

  const handleSave = async (sectionKey) => {
    setSaving(true)
    setStatusMsg({ text: '', type: '' })

    let payload = {}
    if (sectionKey === 'legal') payload = { legal_closing_fees: legal }
    else if (sectionKey === 'mortgage') payload = { mortgage_benchmarks: mortgage }
    else if (sectionKey === 'valuation') payload = { valuation_parameters: valuation }
    else if (sectionKey === 'seller') payload = { seller_packages: seller }
    else if (sectionKey === 'currency') payload = { currency_rates: currencies }
    else {
      payload = {
        legal_closing_fees: legal,
        mortgage_benchmarks: mortgage,
        valuation_parameters: valuation,
        seller_packages: seller,
        currency_rates: currencies,
      }
    }

    try {
      const res = await axios.post('/api/admin/system/settings', { settings: payload })
      if (res.data?.status === 'success') {
        await refreshSettings()
        showNotification('✅ Calculation parameters & pricing updated successfully in system database!')
      }
    } catch (err) {
      showNotification('❌ Failed to update settings: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async (sectionKey) => {
    if (!window.confirm(`Are you sure you want to reset ${sectionKey} calculations back to default national rates?`)) return

    setSaving(true)
    try {
      const res = await axios.post('/api/admin/system/settings/reset', { key: sectionKey })
      if (res.data?.status === 'success') {
        await refreshSettings()
        showNotification(`🔄 Settings for ${sectionKey} have been reset to system defaults.`)
      }
    } catch (err) {
      showNotification('❌ Failed to reset: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  // Helpers for District Valuations
  const currentDistrictData = valuation.districts[selectedDistrict] || {
    basePerch: 2000000,
    growthRate: '8.0% YoY',
    zones: [],
  }

  const handleUpdateCurrentDistrict = (field, value) => {
    setValuation(prev => ({
      ...prev,
      districts: {
        ...prev.districts,
        [selectedDistrict]: {
          ...currentDistrictData,
          [field]: value,
        },
      },
    }))
  }

  const handleUpdateZone = (index, field, value) => {
    const updatedZones = [...(currentDistrictData.zones || [])]
    updatedZones[index] = { ...updatedZones[index], [field]: value }
    handleUpdateCurrentDistrict('zones', updatedZones)
  }

  const handleAddZone = () => {
    const updatedZones = [
      ...(currentDistrictData.zones || []),
      { name: 'New Sub-Zone', multiplier: 1.0, avgPerch: 'Market rate' },
    ]
    handleUpdateCurrentDistrict('zones', updatedZones)
  }

  const handleRemoveZone = (index) => {
    const updatedZones = currentDistrictData.zones.filter((_, i) => i !== index)
    handleUpdateCurrentDistrict('zones', updatedZones)
  }

  const handleAddDistrict = () => {
    const trimmed = newDistrictName.trim()
    if (!trimmed) return
    setValuation(prev => ({
      ...prev,
      districts: {
        ...prev.districts,
        [trimmed]: {
          basePerch: 1500000,
          growthRate: '8.0% YoY',
          zones: [{ name: `${trimmed} City Centre`, multiplier: 1.5, avgPerch: 'Rs. 2M - 3M/perch' }],
        },
      },
    }))
    setSelectedDistrict(trimmed)
    setNewDistrictName('')
    setShowAddDistrict(false)
    showNotification(`District "${trimmed}" added! Remember to click Save to publish.`)
  }

  // Bank rate helpers
  const handleUpdateBankRate = (index, field, value) => {
    const updated = [...(mortgage.bank_rates || [])]
    updated[index] = { ...updated[index], [field]: value }
    setMortgage(prev => ({ ...prev, bank_rates: updated }))
  }

  const handleAddBank = () => {
    setMortgage(prev => ({
      ...prev,
      bank_rates: [
        ...(prev.bank_rates || []),
        { bank: 'New Bank', rate: '12.00% - 13.00%', tag: 'Standard' },
      ],
    }))
  }

  const handleRemoveBank = (index) => {
    setMortgage(prev => ({
      ...prev,
      bank_rates: prev.bank_rates.filter((_, i) => i !== index),
    }))
  }

  // Listing plans helpers
  const handleUpdatePlan = (index, field, value) => {
    const updated = [...(seller.listing_plans || [])]
    updated[index] = { ...updated[index], [field]: value }
    setSeller(prev => ({ ...prev, listing_plans: updated }))
  }

  return (
    <section className="admin-panel admin-pricing-hub">
      <div className="pricing-hub__header">
        <div>
          <span className="pricing-hub__badge">⚙️ System Control</span>
          <h2>Calculations & Dynamic Pricing Hub</h2>
          <p>
            Configure legal stamp duty formulas, district perch valuations, mortgage benchmarks, listing package prices, and exchange rates in real-time.
          </p>
        </div>
        <div className="pricing-hub__header-actions">
          <button
            type="button"
            className="btn-save-all"
            disabled={saving}
            onClick={() => handleSave('all')}
          >
            {saving ? 'Saving...' : '💾 Save All System Settings'}
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`pricing-hub__alert ${statusMsg.type === 'error' ? 'pricing-hub__alert--error' : ''}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Hub Tabs */}
      <div className="pricing-hub__tabs">
        <button
          type="button"
          className={`pricing-hub__tab ${activeTab === 'legal' ? 'active' : ''}`}
          onClick={() => setActiveTab('legal')}
        >
          🏛️ Legal & Stamp Duty
        </button>
        <button
          type="button"
          className={`pricing-hub__tab ${activeTab === 'mortgage' ? 'active' : ''}`}
          onClick={() => setActiveTab('mortgage')}
        >
          🏡 Mortgage & Banks
        </button>
        <button
          type="button"
          className={`pricing-hub__tab ${activeTab === 'valuation' ? 'active' : ''}`}
          onClick={() => setActiveTab('valuation')}
        >
          📊 District Perch Valuations
        </button>
        <button
          type="button"
          className={`pricing-hub__tab ${activeTab === 'seller' ? 'active' : ''}`}
          onClick={() => setActiveTab('seller')}
        >
          🏷️ Seller Packages & Commission
        </button>
        <button
          type="button"
          className={`pricing-hub__tab ${activeTab === 'currency' ? 'active' : ''}`}
          onClick={() => setActiveTab('currency')}
        >
          💱 Currency Exchange Rates
        </button>
      </div>

      {/* Tab 1: Legal & Closing Fees */}
      {activeTab === 'legal' && (
        <div className="pricing-hub__content">
          <div className="pricing-hub__desc-box">
            <strong>Provincial Council Stamp Duty & Conveyance Legal Rates</strong>
            <p>
              These rates directly power the <strong>Stamp Duty & Closing Cost Calculator</strong>. Changes take effect across the website immediately.
            </p>
          </div>

          <div className="pricing-grid-2">
            <div className="pricing-card">
              <h4>🏛️ Stamp Duty Formula</h4>
              <div className="form-field">
                <label>Tier 1 Threshold Value (LKR)</label>
                <input
                  type="number"
                  value={legal.stamp_duty_threshold}
                  onChange={e => setLegal({ ...legal, stamp_duty_threshold: Number(e.target.value) })}
                />
                <small>Currently: Rs. {Number(legal.stamp_duty_threshold).toLocaleString()}</small>
              </div>

              <div className="form-field">
                <label>Tier 1 Rate (%) (Applied on first Rs. {Number(legal.stamp_duty_threshold).toLocaleString()})</label>
                <input
                  type="number"
                  step="0.1"
                  value={legal.stamp_duty_tier1_rate}
                  onChange={e => setLegal({ ...legal, stamp_duty_tier1_rate: Number(e.target.value) })}
                />
              </div>

              <div className="form-field">
                <label>Tier 2 Rate (%) (Applied on remaining balance above threshold)</label>
                <input
                  type="number"
                  step="0.1"
                  value={legal.stamp_duty_tier2_rate}
                  onChange={e => setLegal({ ...legal, stamp_duty_tier2_rate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pricing-card">
              <h4>⚖️ Legal & Registration Fees</h4>
              <div className="form-field">
                <label>Lawyer / Notary Conveyance Fee Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={legal.lawyer_notary_rate}
                  onChange={e => setLegal({ ...legal, lawyer_notary_rate: Number(e.target.value) })}
                />
                <small>Standard Sri Lankan Bar Association fee is 1.0% – 1.5% of deed consideration.</small>
              </div>

              <div className="form-field">
                <label>Land Registry Registration Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={legal.land_registry_rate}
                  onChange={e => setLegal({ ...legal, land_registry_rate: Number(e.target.value) })}
                />
              </div>

              <div className="form-field">
                <label>Land Registry Maximum Fee Cap (LKR)</label>
                <input
                  type="number"
                  value={legal.land_registry_cap}
                  onChange={e => setLegal({ ...legal, land_registry_cap: Number(e.target.value) })}
                />
                <small>Maximum statutory fee (default Rs. 50,000).</small>
              </div>

              <div className="form-field">
                <label>30-Year Title & Folio Search Fee (LKR)</label>
                <input
                  type="number"
                  value={legal.title_search_fee}
                  onChange={e => setLegal({ ...legal, title_search_fee: Number(e.target.value) })}
                />
                <small>Fixed fee for title search across provincial land registries.</small>
              </div>
            </div>
          </div>

          <div className="pricing-hub__footer">
            <button
              type="button"
              className="btn-save"
              disabled={saving}
              onClick={() => handleSave('legal')}
            >
              Save Legal & Stamp Duty Rates
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={() => handleReset('legal_closing_fees')}
            >
              Reset to National Defaults
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Mortgage & Banking Benchmarks */}
      {activeTab === 'mortgage' && (
        <div className="pricing-hub__content">
          <div className="pricing-hub__desc-box">
            <strong>Commercial Bank Benchmark Loan Rates & Default Parameters</strong>
            <p>
              Controls the default calculation sliders in the <strong>Mortgage & Home Loan EMI Calculator</strong> and the live bank comparison table.
            </p>
          </div>

          <div className="pricing-grid-3">
            <div className="pricing-card">
              <label className="form-label-bold">Benchmark Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                className="hub-input"
                value={mortgage.benchmark_interest_rate}
                onChange={e => setMortgage({ ...mortgage, benchmark_interest_rate: Number(e.target.value) })}
              />
              <small>Default starting interest rate on home loans</small>
            </div>

            <div className="pricing-card">
              <label className="form-label-bold">Default Down Payment (%)</label>
              <input
                type="number"
                step="5"
                className="hub-input"
                value={mortgage.default_down_payment_pct}
                onChange={e => setMortgage({ ...mortgage, default_down_payment_pct: Number(e.target.value) })}
              />
              <small>Standard minimum down payment percentage</small>
            </div>

            <div className="pricing-card">
              <label className="form-label-bold">Default Loan Tenure (Years)</label>
              <input
                type="number"
                className="hub-input"
                value={mortgage.default_tenure_years}
                onChange={e => setMortgage({ ...mortgage, default_tenure_years: Number(e.target.value) })}
              />
              <small>Default loan amortization period</small>
            </div>
          </div>

          <div className="pricing-card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4>🏦 Sri Lanka Commercial Bank Rate Comparison Table</h4>
              <button type="button" className="btn-add-mini" onClick={handleAddBank}>
                + Add Bank
              </button>
            </div>

            <div className="hub-table-wrap">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>Bank Name</th>
                    <th>Interest Rate Range</th>
                    <th>Badge / Feature Tag</th>
                    <th style={{ width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(mortgage.bank_rates || []).map((b, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={b.bank}
                          onChange={e => handleUpdateBankRate(idx, 'bank', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={b.rate}
                          onChange={e => handleUpdateBankRate(idx, 'rate', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={b.tag}
                          onChange={e => handleUpdateBankRate(idx, 'tag', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete-row"
                          onClick={() => handleRemoveBank(idx)}
                          title="Delete Bank"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pricing-hub__footer">
            <button
              type="button"
              className="btn-save"
              disabled={saving}
              onClick={() => handleSave('mortgage')}
            >
              Save Mortgage & Bank Benchmarks
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={() => handleReset('mortgage_benchmarks')}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: District Perch Valuations */}
      {activeTab === 'valuation' && (
        <div className="pricing-hub__content">
          <div className="pricing-hub__desc-box">
            <strong>Island-wide District Perch Valuations & Construction Replacement Costs</strong>
            <p>
              Directly powers the <strong>Property Valuation Estimator</strong>. You can customize base perch rates, sub-zone multipliers, and add new districts across Sri Lanka.
            </p>
          </div>

          {/* Construction Costs & Road Factors */}
          <div className="pricing-grid-2" style={{ marginBottom: '24px' }}>
            <div className="pricing-card">
              <h4>🏗️ Building Construction Replacement Cost (LKR / Sq.Ft)</h4>
              <div className="form-field">
                <label>Modern / Newly Built Architectural (Rs / sq.ft)</label>
                <input
                  type="number"
                  value={valuation.construction_sqft_costs?.modern || 8500}
                  onChange={e => setValuation({
                    ...valuation,
                    construction_sqft_costs: {
                      ...valuation.construction_sqft_costs,
                      modern: Number(e.target.value),
                    },
                  })}
                />
              </div>
              <div className="form-field">
                <label>Standard / Well-Maintained House (Rs / sq.ft)</label>
                <input
                  type="number"
                  value={valuation.construction_sqft_costs?.standard || 5500}
                  onChange={e => setValuation({
                    ...valuation,
                    construction_sqft_costs: {
                      ...valuation.construction_sqft_costs,
                      standard: Number(e.target.value),
                    },
                  })}
                />
              </div>
            </div>

            <div className="pricing-card">
              <h4>🛣️ Road Access Width Multipliers</h4>
              <div className="form-field">
                <label>20ft+ Wide Carpeted Access Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={valuation.road_factors?.['20ft'] || 1.08}
                  onChange={e => setValuation({
                    ...valuation,
                    road_factors: { ...valuation.road_factors, '20ft': Number(e.target.value) },
                  })}
                />
                <small>1.08 = +8% premium for wide road access</small>
              </div>
              <div className="form-field">
                <label>10ft - 12ft By-Road Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={valuation.road_factors?.['10ft'] || 0.88}
                  onChange={e => setValuation({
                    ...valuation,
                    road_factors: { ...valuation.road_factors, '10ft': Number(e.target.value) },
                  })}
                />
                <small>0.88 = -12% discount for narrow access</small>
              </div>
            </div>
          </div>

          {/* District Selector & Zone Editor */}
          <div className="pricing-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label className="form-label-bold" style={{ margin: 0 }}>Select District:</label>
                <select
                  className="hub-select"
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                >
                  {Object.keys(valuation.districts || {}).map(d => (
                    <option key={d} value={d}>{d} District</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-add-mini"
                  onClick={() => setShowAddDistrict(!showAddDistrict)}
                >
                  {showAddDistrict ? 'Cancel' : '+ Add New District'}
                </button>
              </div>
            </div>

            {showAddDistrict && (
              <div className="add-district-box">
                <input
                  type="text"
                  placeholder="Enter district name (e.g. Matara, Kurunegala, Jaffna)"
                  value={newDistrictName}
                  onChange={e => setNewDistrictName(e.target.value)}
                />
                <button type="button" className="btn-add-mini" onClick={handleAddDistrict}>
                  Add District
                </button>
              </div>
            )}

            <div className="pricing-grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-field">
                <label>Base Perch Price for {selectedDistrict} (LKR)</label>
                <input
                  type="number"
                  step="50000"
                  value={currentDistrictData.basePerch || 0}
                  onChange={e => handleUpdateCurrentDistrict('basePerch', Number(e.target.value))}
                />
                <small>Currently: Rs. {Number(currentDistrictData.basePerch || 0).toLocaleString()} / perch</small>
              </div>

              <div className="form-field">
                <label>Historical Appreciation Growth Rate</label>
                <input
                  type="text"
                  value={currentDistrictData.growthRate || ''}
                  placeholder="e.g. 8.5% YoY"
                  onChange={e => handleUpdateCurrentDistrict('growthRate', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong>Sub-Zones & Valuations in {selectedDistrict}</strong>
              <button type="button" className="btn-add-mini" onClick={handleAddZone}>
                + Add Sub-Zone
              </button>
            </div>

            <div className="hub-table-wrap">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>Sub-Zone / Towns</th>
                    <th>Multiplier (vs Base)</th>
                    <th>Average Benchmark Display</th>
                    <th style={{ width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentDistrictData.zones || []).map((z, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={z.name}
                          onChange={e => handleUpdateZone(idx, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.05"
                          className="table-input"
                          value={z.multiplier}
                          onChange={e => handleUpdateZone(idx, 'multiplier', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={z.avgPerch}
                          onChange={e => handleUpdateZone(idx, 'avgPerch', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete-row"
                          onClick={() => handleRemoveZone(idx)}
                          title="Delete Zone"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pricing-hub__footer">
            <button
              type="button"
              className="btn-save"
              disabled={saving}
              onClick={() => handleSave('valuation')}
            >
              Save District Valuations
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={() => handleReset('valuation_parameters')}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Seller Packages & Commissions */}
      {activeTab === 'seller' && (
        <div className="pricing-hub__content">
          <div className="pricing-hub__desc-box">
            <strong>Seller Listing Plan Pricing & Platform Revenue Splits</strong>
            <p>
              Allows the admin to adjust listing submission fees (Basic, Verified, Featured) and platform commission percentages on lawyer bookings.
            </p>
          </div>

          <div className="pricing-grid-2" style={{ marginBottom: '24px' }}>
            <div className="pricing-card">
              <h4>⚖️ Legal Consultation & Revenue Split</h4>
              <div className="form-field">
                <label>Default Lawyer Consultation Fee (LKR)</label>
                <input
                  type="number"
                  value={seller.lawyer_consultation_default_fee || 5000}
                  onChange={e => setSeller({ ...seller, lawyer_consultation_default_fee: Number(e.target.value) })}
                />
                <small>Standard consultation fee charged to clients</small>
              </div>

              <div className="form-field">
                <label>Platform Commission (%)</label>
                <input
                  type="number"
                  step="1"
                  value={seller.platform_commission_pct || 25}
                  onChange={e => setSeller({ ...seller, platform_commission_pct: Number(e.target.value) })}
                />
                <small>
                  Platform keeps {seller.platform_commission_pct}% (Rs. {(seller.lawyer_consultation_default_fee * (seller.platform_commission_pct / 100)).toLocaleString()}), lawyer receives {100 - seller.platform_commission_pct}%.
                </small>
              </div>
            </div>

            <div className="pricing-card">
              <h4>📦 Active Listing Plans Summary</h4>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                These plans are presented to property owners when they submit land or houses on the <strong>Sell Property</strong> page.
              </p>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(seller.listing_plans || []).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>{p.name}</strong>
                    <span style={{ color: '#047857', fontWeight: '700' }}>Rs. {Number(p.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pricing-card">
            <h4>Edit Listing Subscription Plans</h4>
            <div className="hub-table-wrap">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Price (LKR)</th>
                    <th>Description Text</th>
                  </tr>
                </thead>
                <tbody>
                  {(seller.listing_plans || []).map((plan, idx) => (
                    <tr key={plan.id}>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={plan.name}
                          onChange={e => handleUpdatePlan(idx, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input"
                          value={plan.price}
                          onChange={e => handleUpdatePlan(idx, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          value={plan.text}
                          onChange={e => handleUpdatePlan(idx, 'text', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pricing-hub__footer">
            <button
              type="button"
              className="btn-save"
              disabled={saving}
              onClick={() => handleSave('seller')}
            >
              Save Seller Package Pricing
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={() => handleReset('seller_packages')}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Currency Exchange Rates */}
      {activeTab === 'currency' && (
        <div className="pricing-hub__content">
          <div className="pricing-hub__desc-box">
            <strong>Foreign Currency Exchange Rates (vs LKR)</strong>
            <p>
              Controls real-time price conversions in USD, GBP, EUR, AUD, AED, and CAD for international buyers and Sri Lankan diaspora.
            </p>
          </div>

          <div className="pricing-grid-3">
            {Object.entries(currencies).map(([code, config]) => (
              <div key={code} className="pricing-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '22px' }}>{config.flag}</span>
                  <strong>{config.label} ({config.code})</strong>
                </div>

                <div className="form-field">
                  <label>1 {config.code} in LKR:</label>
                  {code === 'LKR' ? (
                    <input type="text" className="hub-input" value="1.0 (Base)" disabled />
                  ) : (
                    <input
                      type="number"
                      step="0.5"
                      className="hub-input"
                      value={Math.round(1 / config.rate)}
                      onChange={e => {
                        const lkrPerUnit = Number(e.target.value)
                        if (lkrPerUnit > 0) {
                          setCurrencies({
                            ...currencies,
                            [code]: { ...config, rate: 1 / lkrPerUnit },
                          })
                        }
                      }}
                    />
                  )}
                  <small>
                    {code !== 'LKR' && `Multiplier rate: ${config.rate?.toFixed(7)}`}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-hub__footer">
            <button
              type="button"
              className="btn-save"
              disabled={saving}
              onClick={() => handleSave('currency')}
            >
              Save Currency Exchange Rates
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={() => handleReset('currency_rates')}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
