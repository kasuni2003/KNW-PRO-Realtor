import { useState } from 'react'
import './AiDescriptionGenerator.css'

export default function AiDescriptionGenerator({ onApply, onClose, currentType = 'House', currentDistrict = 'Colombo' }) {
  const [propertyType, setPropertyType] = useState(currentType)
  const [district, setDistrict] = useState(currentDistrict)
  const [extent, setExtent] = useState('15 perches')
  const [bedrooms, setBedrooms] = useState('3 Bedrooms, 2 Bathrooms')
  const [features, setFeatures] = useState([
    'Clear title deeds (Bim Saviya / 30-year deed chain)',
    '20ft wide access road',
    'Pipe-borne water & 3-phase electricity',
    'Close to leading schools & supermarkets',
  ])
  const [customPoints, setCustomPoints] = useState('')
  const [tone, setTone] = useState('luxury') // 'luxury' | 'investment' | 'family'
  const [generating, setGenerating] = useState(false)
  const [generatedOptions, setGeneratedOptions] = useState(null)
  const [selectedLang, setSelectedLang] = useState('en')

  const sampleHighlights = [
    'Boundary wall with roller gate',
    'Swimming pool & landscaped garden',
    'Scenic paddy / mountain view',
    'Beachfront / walking distance to beach',
    'Rooftop terrace with panoramic view',
    'COC & approved building plan available',
    'High rental yield potential',
    '5 mins to Highway entrance',
  ]

  const toggleFeature = (feat) => {
    setFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    )
  }

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      const allFeatures = [...features]
      if (customPoints.trim()) allFeatures.push(customPoints.trim())

      const enDesc = tone === 'luxury'
        ? `Exquisite ${propertyType} situated in the prestigious neighborhood of ${district}. Spanning ${extent} with ${bedrooms}, this exceptional property seamlessly combines modern architectural elegance with everyday comfort. Key highlights include ${allFeatures.slice(0, 4).join(', ')}. Ideal for discerning buyers seeking an executive lifestyle with prime accessibility and guaranteed long-term capital appreciation. Inspection by prior appointment only.`
        : tone === 'investment'
        ? `Prime investment opportunity: High-demand ${propertyType} located in ${district} (${extent}). Featuring ${bedrooms} and robust infrastructure including ${allFeatures.slice(0, 3).join(', ')}. Situated in a rapidly growing commercial/residential corridor offering outstanding rental returns and capital growth. Complete legal documentation with clear title verified. Contact us to schedule a site inspection.`
        : `Warm and welcoming family ${propertyType} located in a quiet and secure residential pocket of ${district}. Set on ${extent} with ${bedrooms}. Highlights include ${allFeatures.slice(0, 4).join(', ')}. Walking distance to public transport, daily conveniences, and top schools. A ready-to-move-in property with 100% clear deeds. Serious buyers are invited to contact for viewings.`;

      const siDesc = `${district} ප්‍රදේශයේ පිහිටි අගනා ${propertyType === 'House' ? 'දෙමහල් නිවස' : propertyType === 'Land' ? 'ඉඩම' : 'දේපළ'}. පර්චස් ${extent.replace(/[^0-9.]/g, '') || '15'} ක ඉඩකඩ සහිතයි. ${bedrooms}. සියලු නාගරික පහසුකම් වලින් සමන්විත වන අතර ${allFeatures.slice(0, 3).join(', ')} ඇතුළත් වේ. නිරවුල් ඔප්පු සහ අනුමත පිඹුරුපත් සහිතයි. බැංකු ණය පහසුකම් ලබා ගත හැක. මිල සාකච්ඡා කරගත හැක. වැඩි විස්තර සඳහා අමතන්න.`;

      const taDesc = `${district} பகுதியில் அமைந்துள்ள அருமையான ${propertyType === 'House' ? 'வீடு' : propertyType === 'Land' ? 'காணி' : 'சொத்து'}. பரப்பு: ${extent}. ${bedrooms}. முக்கிய அம்சங்கள்: ${allFeatures.slice(0, 3).join(', ')}. தெளிவான உறுதிப் பத்திரங்கள் மற்றும் வங்கி கடன் வசதிகளுடன் கூடியது. மேலதிக விபரங்களுக்கு இன்றே தொடர்பு கொள்ளவும்.`;

      setGeneratedOptions({
        en: enDesc,
        si: siDesc,
        ta: taDesc,
      })
      setGenerating(false)
    }, 700)
  }

  return (
    <div className="ai-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="ai-modal">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-title-wrap">
            <span className="ai-badge-icon">✨ AI</span>
            <div>
              <h3>AI Property Description Generator</h3>
              <p>Turn basic bullet points into polished, high-converting descriptions in 3 languages</p>
            </div>
          </div>
          <button className="ai-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="ai-body">
          {/* Controls */}
          <div className="ai-form-side">
            <div className="ai-row">
              <label className="ai-label">
                Property Type
                <select className="ai-select" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                  <option value="House">Luxury House / Villa</option>
                  <option value="Apartment">Modern Apartment</option>
                  <option value="Land">Bare Land / Plot</option>
                  <option value="Commercial">Commercial Building</option>
                </select>
              </label>
              <label className="ai-label">
                District / Location
                <input className="ai-input" value={district} onChange={e => setDistrict(e.target.value)} />
              </label>
            </div>

            <div className="ai-row">
              <label className="ai-label">
                Extent / Land Size
                <input className="ai-input" value={extent} onChange={e => setExtent(e.target.value)} placeholder="e.g. 12.5 perches" />
              </label>
              <label className="ai-label">
                Rooms / Setup
                <input className="ai-input" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="e.g. 4 beds, 3 baths" />
              </label>
            </div>

            <label className="ai-label">
              Marketing Tone
              <div className="ai-tone-selector">
                <button type="button" className={`ai-tone-btn ${tone === 'luxury' ? 'active' : ''}`} onClick={() => setTone('luxury')}>
                  💎 Luxury & Executive
                </button>
                <button type="button" className={`ai-tone-btn ${tone === 'family' ? 'active' : ''}`} onClick={() => setTone('family')}>
                  🏡 Family Home
                </button>
                <button type="button" className={`ai-tone-btn ${tone === 'investment' ? 'active' : ''}`} onClick={() => setTone('investment')}>
                  📈 High-ROI Investor
                </button>
              </div>
            </label>

            <label className="ai-label">
              Quick Feature Tags (Click to toggle):
              <div className="ai-chip-grid">
                {sampleHighlights.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`ai-chip ${features.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleFeature(tag)}
                  >
                    {features.includes(tag) ? '✓ ' : '+ '}{tag}
                  </button>
                ))}
              </div>
            </label>

            <label className="ai-label">
              Additional Custom Notes (Optional):
              <input
                className="ai-input"
                value={customPoints}
                onChange={e => setCustomPoints(e.target.value)}
                placeholder="e.g. 2 car garage, solar panels, walking distance to Keells"
              />
            </label>

            <button
              type="button"
              className="ai-generate-btn"
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? '✨ Generating Smart Descriptions...' : '✨ Generate Multilingual Descriptions'}
            </button>
          </div>

          {/* Result preview */}
          <div className="ai-result-side">
            <h4>Generated Result</h4>
            {generatedOptions ? (
              <div className="ai-result-box">
                {/* Language switcher */}
                <div className="ai-lang-tabs">
                  <button
                    type="button"
                    className={`ai-lang-tab ${selectedLang === 'en' ? 'active' : ''}`}
                    onClick={() => setSelectedLang('en')}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    className={`ai-lang-tab ${selectedLang === 'si' ? 'active' : ''}`}
                    onClick={() => setSelectedLang('si')}
                  >
                    🇱🇰 සිංහල
                  </button>
                  <button
                    type="button"
                    className={`ai-lang-tab ${selectedLang === 'ta' ? 'active' : ''}`}
                    onClick={() => setSelectedLang('ta')}
                  >
                    🇮🇳 தமிழ்
                  </button>
                </div>

                <div className="ai-generated-text">
                  <p>{generatedOptions[selectedLang]}</p>
                </div>

                <div className="ai-result-actions">
                  <button
                    type="button"
                    className="ai-apply-btn"
                    onClick={() => {
                      onApply(generatedOptions[selectedLang])
                      onClose?.()
                    }}
                  >
                    ✓ Apply This Description to Listing Form
                  </button>
                  <button
                    type="button"
                    className="ai-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedOptions[selectedLang])
                      alert('Description copied to clipboard!')
                    }}
                  >
                    Copy Text
                  </button>
                </div>
              </div>
            ) : (
              <div className="ai-placeholder">
                <span className="ai-placeholder-icon">🤖</span>
                <p>Click "Generate Multilingual Descriptions" to generate SEO-optimized descriptions in English, Sinhala, and Tamil.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
