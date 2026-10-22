import './CallToAction.css'
import { useLanguage } from '../context/LanguageContext'

export default function CallToAction({ onNavigate }) {
  const { t } = useLanguage()

  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <div className="cta-text">
          <h2 className="cta-heading">{t('cta.title')}</h2>
          <p className="cta-sub">
            {t('cta.subtitle')}
          </p>
        </div>
        <div className="cta-actions">
          <button className="btn-white" onClick={() => onNavigate?.('sell')}>
            {t('cta.start')}
          </button>
          <button className="btn-outline" onClick={() => onNavigate?.('sell')}>{t('cta.how')}</button>
        </div>
      </div>
    </section>
  )
}
