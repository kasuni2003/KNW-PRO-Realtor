import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './Hero.css'

const districts = [
  'Any District','Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar','Vavuniya',
  'Mullaitivu','Batticaloa','Ampara','Trincomalee','Kurunegala','Puttalam',
  'Anuradhapura','Polonnaruwa','Badulla','Monaragala','Ratnapura','Kegalle',
]

const budgets = [
  'Any Budget','Under LKR 5M','LKR 5M - 20M','LKR 20M - 50M',
  'LKR 50M - 100M','LKR 100M+',
]

export default function Hero({ onNavigate }) {
  const { t, language } = useLanguage()
  const tabs = t('hero.tabs')
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [propType, setPropType] = useState('')
  const [district, setDistrict] = useState('')
  const [budget, setBudget] = useState('')

  useEffect(() => {
    setActiveTab(tabs[0])
  }, [tabs, language])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (activeTab && activeTab !== 'Buy') params.set('type', activeTab.toLowerCase())
    if (propType) params.set('propType', propType)
    if (district && district !== 'Any District') params.set('district', district)
    if (budget && budget !== 'Any Budget') params.set('budget', budget)

    const searchUrl = `/properties${params.toString() ? `?${params.toString()}` : ''}`
    if (onNavigate) {
      onNavigate('properties')
      window.history.pushState({}, '', searchUrl)
    } else {
      window.location.href = searchUrl
    }
  }

  const handlePopularClick = (e, item) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate('properties')
      window.history.pushState({}, '', `/properties?q=${encodeURIComponent(item)}`)
    } else {
      window.location.href = `/properties?q=${encodeURIComponent(item)}`
    }
  }

  return (
    <section className="hero">
      <div className="hero__bg-dots" aria-hidden="true" />

      <div className="container hero__content">
        <span className="hero__badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {t('hero.badge')}
        </span>

        <h1 className="hero__heading">
          {t('hero.titleA')}<br />
          <span className="hero__heading-accent">{t('hero.titleB')}</span>
        </h1>
        <p className="hero__sub">{t('hero.subtitle')}</p>

        <div className="search-card">
          <div className="search-card__tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                type="button"
                className={`search-card__tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-card__row">
            <div className="search-field">
              <label htmlFor="propType">{t('hero.propertyType')}</label>
              <select id="propType" value={propType} onChange={event => setPropType(event.target.value)}>
                <option value="">{t('hero.allTypes')}</option>
                <option>Land</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
                <option>Commercial</option>
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="district">{t('hero.district')}</label>
              <select id="district" value={district} onChange={event => setDistrict(event.target.value)}>
                {districts.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="budget">{t('hero.budget')}</label>
              <select id="budget" value={budget} onChange={event => setBudget(event.target.value)}>
                {budgets.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>

            <button className="search-card__btn" type="button" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              {t('hero.search')}
            </button>
          </div>

          <p className="search-card__hint">
            {t('hero.popular')} {t('hero.popularItems').map((item, index) => (
              <span key={item}>
                {index > 0 && ' · '}
                <a href={`/properties?q=${encodeURIComponent(item)}`} onClick={(e) => handlePopularClick(e, item)}>
                  {item}
                </a>
              </span>
            ))}
          </p>
        </div>

        <div className="hero__trust-strip">
          <div className="hero__trust-item">
            <span className="hero__trust-icon">⚖️</span>
            <span>Lawyer Verified Deeds</span>
          </div>
          <div className="hero__trust-item">
            <span className="hero__trust-icon">🛡️</span>
            <span>Verified Direct Sellers</span>
          </div>
          <div className="hero__trust-item">
            <span className="hero__trust-icon">📍</span>
            <span>25 Island Districts</span>
          </div>
          <div className="hero__trust-item">
            <span className="hero__trust-icon">🏡</span>
            <span>500+ Prime Listings</span>
          </div>
        </div>
      </div>
    </section>
  )
}
