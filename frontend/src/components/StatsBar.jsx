import './StatsBar.css'
import { useLanguage } from '../context/LanguageContext'

export default function StatsBar() {
  const { t } = useLanguage()
  const stats = [
    { value: '2,400+', label: t('stats.active') },
    { value: '850+',   label: t('stats.sold') },
    { value: '25',     label: t('stats.districts') },
    { value: '18',     label: t('stats.countries') },
  ]

  return (
    <div className="stats-bar">
      <div className="container stats-bar__inner">
        {stats.map((s, i) => (
          <div key={i} className="stats-bar__item">
            <span className="stats-bar__value">{s.value}</span>
            <span className="stats-bar__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
