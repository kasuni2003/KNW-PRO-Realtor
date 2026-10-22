import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import FinancialCalculators from './FinancialCalculators'
import PriceEstimator from './PriceEstimator'
import NotificationBell from './NotificationBell'
import './Navbar.css'

const navLinks = [
  { key: 'buy', page: 'home' },
  { key: 'properties', page: 'properties', label: 'Properties' },
  { key: 'sell', page: 'sell', authRequired: true },
  { key: 'legal', page: 'legal', authRequired: true },
  { key: 'blog', page: 'blog', authRequired: true },
  { key: 'reviews', page: 'reviews' },
  { key: 'about', page: 'about' },
]

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout, activeRole, switchRole } = useAuth()
  const { language, languages, setLanguage, t } = useLanguage()
  const { currency, setCurrency, currencies } = useCurrency()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [showValuation, setShowValuation] = useState(false)

  const visibleNavLinks = navLinks.filter(link => !link.authRequired || Boolean(user))

  const handleLogout = () => {
    logout()
    setDropOpen(false)
  }

  const nav = (page) => {
    onNavigate(page)
    setMenuOpen(false)
  }

  const canOpenAdmin = user && ['admin', 'staff'].includes(user.role)
  const canOpenLawyer = user?.role === 'lawyer'

  const isLawyerProfile = currentPage === 'lawyer'

  return (
    <header className={`navbar ${isLawyerProfile ? 'navbar--lawyer' : ''}`}>
      <div className="container navbar__inner">
        <button className="navbar__logo" onClick={() => nav(isLawyerProfile ? 'lawyer' : 'home')}>
          <div className="navbar__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="navbar__logo-text">KNW PRO REALTOR</span>
          {isLawyerProfile && (
            <span className="navbar__portal-badge">⚖️ Lawyer Profile</span>
          )}
        </button>

        {!isLawyerProfile && (
          <nav className="navbar__links">
            {visibleNavLinks.map(link => (
              <button
                key={link.key}
                className={`navbar__link${currentPage === link.page && link.page !== 'home' ? ' navbar__link--active' : ''}`}
                onClick={() => nav(link.page)}
              >
                {t(`nav.${link.key}`) || link.label}
              </button>
            ))}
            <select
              className="navbar__lang-select"
              value={language}
              onChange={event => setLanguage(event.target.value)}
              aria-label="Language"
            >
              {Object.entries(languages).map(([code, dictionary]) => (
                <option key={code} value={code}>{dictionary.language.short}</option>
              ))}
            </select>
            {user && (
              <>
                <select
                  className="navbar__lang-select"
                  value={currency}
                  onChange={event => setCurrency(event.target.value)}
                  aria-label="Currency"
                  title="Convert Currency"
                >
                  {Object.values(currencies).map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="navbar__link"
                  style={{ fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowCalc(true)}
                  title="Stamp Duty & Mortgage Calculators"
                >
                  🧮 Calc
                </button>
                <button
                  type="button"
                  className="navbar__link"
                  style={{ fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowValuation(true)}
                  title="Property Valuation Estimator"
                >
                  📊 Valuation
                </button>
              </>
            )}
          </nav>
        )}

        <div className="navbar__actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NotificationBell onNavigate={onNavigate} />
              <div className="navbar__user-wrap">
                <button className="navbar__user-btn" onClick={() => setDropOpen(open => !open)}>
                  <div className="navbar__avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="navbar__user-name">{user.name}</span>
                  <span className={`navbar__mode-badge navbar__mode-badge--${activeRole || 'buyer'}`}>
                    {activeRole === 'seller' ? '🏷️ Seller' : activeRole === 'lawyer' ? '⚖️ Lawyer' : activeRole === 'admin' ? '⚙️ Admin' : '🛒 Buyer'}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__drop-header">
                      <div className="navbar__avatar navbar__avatar--lg">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="navbar__drop-name">{user.name}</p>
                        <p className="navbar__drop-email">{user.email}</p>
                        <span className="navbar__drop-role">Primary: {user.role}</span>
                      </div>
                    </div>

                    {/* Quick Mode Switcher */}
                    <div className="navbar__role-switcher">
                      <span className="navbar__role-switcher-title">Switch Account Mode</span>
                      <div className="navbar__role-pills">
                        <button
                          type="button"
                          className={`navbar__role-pill ${activeRole === 'buyer' ? 'navbar__role-pill--active' : ''}`}
                          onClick={() => {
                            switchRole('buyer')
                            setDropOpen(false)
                            nav('buyerDashboard')
                          }}
                          title="Switch to Buyer Mode"
                        >
                          🛒 Buyer
                        </button>
                        <button
                          type="button"
                          className={`navbar__role-pill ${activeRole === 'seller' ? 'navbar__role-pill--active navbar__role-pill--seller' : ''}`}
                          onClick={() => {
                            switchRole('seller')
                            setDropOpen(false)
                            nav('sellerDashboard')
                          }}
                          title="Switch to Seller Mode"
                        >
                          🏷️ Seller
                        </button>
                        {canOpenLawyer && (
                          <button
                            type="button"
                            className={`navbar__role-pill ${activeRole === 'lawyer' ? 'navbar__role-pill--active navbar__role-pill--lawyer' : ''}`}
                            onClick={() => {
                              switchRole('lawyer')
                              setDropOpen(false)
                              nav('lawyer')
                            }}
                            title="Switch to Lawyer Mode"
                          >
                            ⚖️ Lawyer
                          </button>
                        )}
                        {canOpenAdmin && (
                          <button
                            type="button"
                            className={`navbar__role-pill ${activeRole === 'admin' ? 'navbar__role-pill--active navbar__role-pill--admin' : ''}`}
                            onClick={() => {
                              switchRole('admin')
                              setDropOpen(false)
                              nav('admin')
                            }}
                            title="Switch to Admin Mode"
                          >
                            ⚙️ Admin
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="navbar__drop-divider" />

                    {/* Buyer Dashboard */}
                    <button className="navbar__drop-item" onClick={() => { setDropOpen(false); switchRole('buyer'); nav('buyerDashboard') }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Buyer Hub (Shortlist & Visits)
                    </button>

                    {/* Seller Dashboard */}
                    <button className="navbar__drop-item" onClick={() => { setDropOpen(false); switchRole('seller'); nav('sellerDashboard') }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                      </svg>
                      Seller Dashboard (My Listings)
                    </button>

                    {/* Lawyer Dashboard */}
                    {canOpenLawyer && (
                      <button className="navbar__drop-item" onClick={() => { setDropOpen(false); switchRole('lawyer'); nav('lawyer') }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                        </svg>
                        Lawyer Dashboard
                      </button>
                    )}

                    {/* Admin Dashboard */}
                    {canOpenAdmin && (
                      <button className="navbar__drop-item" onClick={() => { setDropOpen(false); switchRole('admin'); nav('admin') }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        {t('nav.admin')}
                      </button>
                    )}

                    {isLawyerProfile && (
                      <button className="navbar__drop-item" onClick={() => { setDropOpen(false); nav('home') }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        View Public Website
                      </button>
                    )}

                    <div className="navbar__drop-divider" />
                    <button className="navbar__drop-item navbar__drop-logout" onClick={handleLogout}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button className="navbar__signin" onClick={() => nav('login')}>{t('nav.signIn')}</button>
              <button className="navbar__register-btn" onClick={() => nav('register')}>{t('nav.register')}</button>
              <button className="btn-primary" onClick={() => onNavigate('register', { role: 'seller' })}>{t('nav.listProperty')}</button>
            </>
          )}
        </div>

        {!isLawyerProfile && (
          <button className="navbar__hamburger" onClick={() => setMenuOpen(open => !open)} aria-label="Menu">
            <span /><span /><span />
          </button>
        )}
      </div>

      {!isLawyerProfile && menuOpen && (
        <div className="navbar__mobile">
          {visibleNavLinks.map(link => (
            <button key={link.key} className="navbar__mobile-link" onClick={() => nav(link.page)}>
              {t(`nav.${link.key}`) || link.label}
            </button>
          ))}
          <select
            className="navbar__lang-select navbar__lang-select--mobile"
            value={language}
            onChange={event => setLanguage(event.target.value)}
            aria-label="Language"
          >
            {Object.entries(languages).map(([code, dictionary]) => (
              <option key={code} value={code}>{dictionary.language.label}</option>
            ))}
          </select>
          {user && (
            <>
              <select
                className="navbar__lang-select navbar__lang-select--mobile"
                value={currency}
                onChange={event => setCurrency(event.target.value)}
                aria-label="Currency"
              >
                {Object.values(currencies).map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} ({c.symbol})</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '8px', padding: '6px 0' }}>
                <button
                  type="button"
                  className="navbar__mobile-link"
                  style={{ flex: 1, padding: '8px', fontSize: '13px', background: '#f1f5f9', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  onClick={() => { setMenuOpen(false); setShowCalc(true) }}
                >
                  🧮 Calculators
                </button>
                <button
                  type="button"
                  className="navbar__mobile-link"
                  style={{ flex: 1, padding: '8px', fontSize: '13px', background: '#f1f5f9', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  onClick={() => { setMenuOpen(false); setShowValuation(true) }}
                >
                  📊 Valuation
                </button>
              </div>
            </>
          )}
          <div className="navbar__mobile-actions">
            {user ? (
              <>
                <span className="navbar__mobile-greeting">{t('nav.greeting')}, {user.name}</span>
                <button className="navbar__signin" onClick={() => { setMenuOpen(false); switchRole('buyer'); nav('buyerDashboard') }}>🛒 Buyer Dashboard</button>
                <button className="navbar__signin" onClick={() => { setMenuOpen(false); switchRole('seller'); nav('sellerDashboard') }}>🏷️ Seller Dashboard</button>
                {canOpenLawyer && (
                  <button className="navbar__signin" onClick={() => { setMenuOpen(false); switchRole('lawyer'); nav('lawyer') }}>⚖️ Lawyer Dashboard</button>
                )}
                {canOpenAdmin && (
                  <button className="navbar__signin" onClick={() => { setMenuOpen(false); switchRole('admin'); nav('admin') }}>⚙️ {t('nav.admin')}</button>
                )}
                <button className="navbar__signin" onClick={handleLogout}>{t('nav.signOut')}</button>
              </>
            ) : (
              <>
                <button className="navbar__signin" onClick={() => nav('login')}>{t('nav.signIn')}</button>
                <button className="navbar__register-btn" onClick={() => nav('register')}>{t('nav.register')}</button>
              </>
            )}
            <button className="btn-primary" onClick={() => user ? nav('sell') : onNavigate('register', { role: 'seller' })}>{t('nav.listProperty')}</button>
          </div>
        </div>
      )}

      {dropOpen && <div className="navbar__drop-backdrop" onClick={() => setDropOpen(false)} />}

      {!isLawyerProfile && showCalc && <FinancialCalculators onClose={() => setShowCalc(false)} />}
      {!isLawyerProfile && showValuation && <PriceEstimator onClose={() => setShowValuation(false)} onNavigate={onNavigate} />}
    </header>
  )
}
