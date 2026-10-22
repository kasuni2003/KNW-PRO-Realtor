import './LegalAdvice.css'
import { useLanguage } from '../context/LanguageContext'

const guides = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    iconBg: '#E1F5EE', iconColor: '#0F6E56',
    title: 'Land ownership for foreigners',
    desc: 'What non-citizens can and cannot own under Sri Lankan law, including leasehold options.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    iconBg: '#E6F1FB', iconColor: '#185FA5',
    title: 'Title deed verification',
    desc: 'How to check property titles, survey plans, encumbrances, and easements before buying.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    iconBg: '#FAEEDA', iconColor: '#854F0B',
    title: 'Taxes &amp; stamp duty',
    desc: 'Transfer taxes, stamp duty, VAT, and capital gains on Sri Lankan property transactions.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    iconBg: '#FBEAF0', iconColor: '#993556',
    title: 'Book a lawyer consultation',
    desc: 'Connect with a certified Sri Lankan property lawyer online or at their office.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    iconBg: '#E1F5EE', iconColor: '#0F6E56',
    title: 'FCEPA &amp; currency rules',
    desc: 'Foreign Currency Entitlement rules for remitting funds to buy property in Sri Lanka.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    iconBg: '#E6F1FB', iconColor: '#185FA5',
    title: 'Buying process step-by-step',
    desc: 'From finding a property to final registration — a complete guide to the purchase process.',
  },
]

export default function LegalAdvice({ onNavigate }) {
  const { t } = useLanguage()

  return (
    <section className="legal-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{t('legalHome.title')}</h2>
            <p className="section-subtitle">
              {t('legalHome.subtitle')}
            </p>
          </div>
          <button className="view-all" onClick={() => onNavigate?.('legal')}>
            {t('legalHome.allGuides')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <div className="legal-grid">
          {guides.map((g, i) => (
            <button key={i} className="legal-card" onClick={() => onNavigate?.('legal')}>
              <div className="legal-card__icon"
                style={{ background: g.iconBg, color: g.iconColor }}>
                {g.icon}
              </div>
              <h3 className="legal-card__title"
                dangerouslySetInnerHTML={{ __html: g.title }} />
              <p className="legal-card__desc">{g.desc}</p>
              <span className="legal-card__read">
                {t('legalHome.read')} →
              </span>
            </button>
          ))}
        </div>

        {/* Lawyer CTA banner */}
        <div className="legal-cta">
          <div className="legal-cta__text">
            <strong>{t('legalHome.consultTitle')}</strong>
            <span>{t('legalHome.consultText')}</span>
          </div>
          <button className="btn-primary" onClick={() => onNavigate?.('legal')}>{t('legalHome.consult')}</button>
        </div>
      </div>
    </section>
  )
}
