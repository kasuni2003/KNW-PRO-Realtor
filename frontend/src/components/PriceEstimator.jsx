import { useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import './PriceEstimator.css'

const DISTRICT_VALUATION_DATA = {
  Colombo: {
    basePerch: 3800000,
    growthRate: '8.5% YoY',
    zones: [
      { name: 'Colombo 03 / 07 / 04 (Ultra-Prime)', multiplier: 3.2, avgPerch: 'Rs. 10M - 15M/perch' },
      { name: 'Rajagiriya / Battaramulla / Nawala', multiplier: 1.6, avgPerch: 'Rs. 5M - 7.5M/perch' },
      { name: 'Nugegoda / Maharagama / Dehiwala', multiplier: 1.15, avgPerch: 'Rs. 3.5M - 5M/perch' },
      { name: 'Kottawa / Malabe / Homagama', multiplier: 0.65, avgPerch: 'Rs. 1.8M - 2.8M/perch' },
    ],
  },
  Gampaha: {
    basePerch: 1400000,
    growthRate: '9.2% YoY',
    zones: [
      { name: 'Negombo Beach Road / Tourist Area', multiplier: 2.2, avgPerch: 'Rs. 2.5M - 4.5M/perch' },
      { name: 'Wattala / Kelaniya (Close to Colombo)', multiplier: 1.8, avgPerch: 'Rs. 2.2M - 3.2M/perch' },
      { name: 'Gampaha Town / Kadawatha', multiplier: 1.1, avgPerch: 'Rs. 1.4M - 2.0M/perch' },
      { name: 'Mirigama / Minuwangoda', multiplier: 0.55, avgPerch: 'Rs. 600K - 950K/perch' },
    ],
  },
  Kandy: {
    basePerch: 1900000,
    growthRate: '7.8% YoY',
    zones: [
      { name: 'Kandy Lake Round / City Centre', multiplier: 2.5, avgPerch: 'Rs. 4M - 6M/perch' },
      { name: 'Peradeniya / Anniewatte / Katugastota', multiplier: 1.3, avgPerch: 'Rs. 2M - 3M/perch' },
      { name: 'Kundasale / Digana (Golf Area)', multiplier: 0.95, avgPerch: 'Rs. 1.2M - 1.8M/perch' },
      { name: 'Pilimathalawa / Gampola', multiplier: 0.6, avgPerch: 'Rs. 700K - 1.1M/perch' },
    ],
  },
  Galle: {
    basePerch: 2100000,
    growthRate: '11.4% YoY',
    zones: [
      { name: 'Galle Fort & Direct Beachfront', multiplier: 4.0, avgPerch: 'Rs. 7M - 12M/perch' },
      { name: 'Unawatuna / Thalpe / Ahangama (Coastal)', multiplier: 2.8, avgPerch: 'Rs. 5M - 8M/perch' },
      { name: 'Galle Town / Karapitiya', multiplier: 1.2, avgPerch: 'Rs. 2M - 3.2M/perch' },
      { name: 'Hikkaduwa Inland / Baddegama', multiplier: 0.6, avgPerch: 'Rs. 800K - 1.4M/perch' },
    ],
  },
  'Nuwara Eliya': {
    basePerch: 1800000,
    growthRate: '8.0% YoY',
    zones: [
      { name: 'Gregory Lake / City View', multiplier: 2.4, avgPerch: 'Rs. 3.5M - 5.5M/perch' },
      { name: 'Blackpool / Hawa Eliya', multiplier: 1.1, avgPerch: 'Rs. 1.6M - 2.5M/perch' },
      { name: 'Hatton / Talawakele', multiplier: 0.5, avgPerch: 'Rs. 600K - 1M/perch' },
    ],
  },
  Kalutara: {
    basePerch: 1100000,
    growthRate: '7.5% YoY',
    zones: [
      { name: 'Panadura Beach / Galle Road', multiplier: 1.9, avgPerch: 'Rs. 1.8M - 2.8M/perch' },
      { name: 'Kalutara North & South', multiplier: 1.0, avgPerch: 'Rs. 1M - 1.6M/perch' },
      { name: 'Horana / Bandaragama', multiplier: 0.75, avgPerch: 'Rs. 750K - 1.2M/perch' },
    ],
  },
}

export default function PriceEstimator({ onClose, onNavigate }) {
  const { formatPrice } = useCurrency()
  const [district, setDistrict] = useState('Colombo')
  const [zoneIndex, setZoneIndex] = useState(1)
  const [propertyType, setPropertyType] = useState('land') // 'land' | 'house'
  const [perches, setPerches] = useState(12)
  const [roadWidth, setRoadWidth] = useState('20ft') // '10ft' | '15ft' | '20ft'
  const [houseCondition, setHouseCondition] = useState('modern')

  const districtData = DISTRICT_VALUATION_DATA[district] || DISTRICT_VALUATION_DATA.Colombo
  const currentZone = districtData.zones[zoneIndex] || districtData.zones[0]

  // Road factor
  const roadFactor = roadWidth === '20ft' ? 1.08 : roadWidth === '15ft' ? 1.0 : 0.88

  // Base per perch price
  const estimatedPerPerch = Math.round(districtData.basePerch * currentZone.multiplier * roadFactor)
  const landValue = estimatedPerPerch * perches

  // House construction replacement value
  const houseValue = propertyType === 'house'
    ? perches * 100 * (houseCondition === 'modern' ? 8500 : 5500)
    : 0

  const totalMin = Math.round((landValue + houseValue) * 0.92)
  const totalAvg = Math.round(landValue + houseValue)
  const totalMax = Math.round((landValue + houseValue) * 1.08)

  return (
    <div className="estimator-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="estimator-modal">
        {/* Header */}
        <div className="estimator-header">
          <div className="estimator-title-wrap">
            <span className="estimator-icon">📊</span>
            <div>
              <h3>Sri Lanka Property Valuation Estimator</h3>
              <p>Calculate realistic market price per perch and total property value</p>
            </div>
          </div>
          {onClose && (
            <button className="estimator-close-btn" onClick={onClose} aria-label="Close">
              &times;
            </button>
          )}
        </div>

        <div className="estimator-body">
          {/* Inputs */}
          <div className="estimator-inputs">
            <div className="estimator-row">
              <label className="estimator-label">
                District
                <select
                  className="estimator-select"
                  value={district}
                  onChange={e => {
                    setDistrict(e.target.value)
                    setZoneIndex(0)
                  }}
                >
                  {Object.keys(DISTRICT_VALUATION_DATA).map(d => (
                    <option key={d} value={d}>{d} District</option>
                  ))}
                </select>
              </label>

              <label className="estimator-label">
                Sub-Location / Zone
                <select
                  className="estimator-select"
                  value={zoneIndex}
                  onChange={e => setZoneIndex(Number(e.target.value))}
                >
                  {districtData.zones.map((z, idx) => (
                    <option key={idx} value={idx}>{z.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="estimator-row">
              <label className="estimator-label">
                Property Type
                <select
                  className="estimator-select"
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                >
                  <option value="land">Bare Land / Plot Only</option>
                  <option value="house">House & Land</option>
                </select>
              </label>

              <label className="estimator-label">
                Land Extent (Perches)
                <input
                  type="number"
                  min="1"
                  max="500"
                  className="estimator-input"
                  value={perches}
                  onChange={e => setPerches(Math.max(1, Number(e.target.value)))}
                />
              </label>
            </div>

            <div className="estimator-row">
              <label className="estimator-label">
                Road Access Width
                <select
                  className="estimator-select"
                  value={roadWidth}
                  onChange={e => setRoadWidth(e.target.value)}
                >
                  <option value="20ft">20ft+ Wide Carpeted / Concrete (Prime)</option>
                  <option value="15ft">15ft Standard Vehicle Access</option>
                  <option value="10ft">10ft - 12ft Narrower By-Road</option>
                </select>
              </label>

              {propertyType === 'house' && (
                <label className="estimator-label">
                  House Condition
                  <select
                    className="estimator-select"
                    value={houseCondition}
                    onChange={e => setHouseCondition(e.target.value)}
                  >
                    <option value="modern">Modern / Newly Built (Architectural)</option>
                    <option value="livable">Standard Well-Maintained House</option>
                  </select>
                </label>
              )}
            </div>

            <div className="estimator-growth-banner">
              <strong>📈 Capital Appreciation:</strong> Historical land prices in {district} have grown at ~{districtData.growthRate} over the past 3 years.
            </div>
          </div>

          {/* Results */}
          <div className="estimator-results">
            <span className="estimator-results-kicker">Estimated Market Valuation</span>

            <div className="estimator-price-card">
              <span>Estimated Fair Market Value</span>
              <h2>{formatPrice(totalAvg)}</h2>
              <div className="estimator-range">
                <span>Low: {formatPrice(totalMin)}</span>
                <span>•</span>
                <span>High: {formatPrice(totalMax)}</span>
              </div>
            </div>

            <div className="estimator-detail-row">
              <span>Estimated Per Perch Rate:</span>
              <strong>{formatPrice(estimatedPerPerch)} / perch</strong>
            </div>

            <div className="estimator-detail-row">
              <span>Zone Price Benchmark:</span>
              <em>{currentZone.avgPerch}</em>
            </div>

            {propertyType === 'house' && (
              <div className="estimator-detail-row">
                <span>Estimated Structure / House Value:</span>
                <strong>{formatPrice(houseValue)}</strong>
              </div>
            )}

            <div className="estimator-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  onClose?.()
                  onNavigate?.('sell')
                }}
              >
                List Property at This Price
              </button>
              <button
                className="estimator-btn-sec"
                onClick={() => {
                  onClose?.()
                  onNavigate?.('properties')
                }}
              >
                Find Listings in {district}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
