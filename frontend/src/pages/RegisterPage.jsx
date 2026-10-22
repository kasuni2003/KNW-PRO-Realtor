import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import './AuthPages.css'

const roles = [
  { value: 'buyer',  labelKey: 'buyer',  descKey: 'buyerDesc' },
  { value: 'seller', labelKey: 'seller', descKey: 'sellerDesc' },
]

export default function RegisterPage({ onNavigate, initialRole = 'buyer' }) {
  const { register, authError, setAuthError } = useAuth()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: initialRole,
    phone: '',
    nic_number: '',
    address: '',
    nic_document: null,
  })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [agree, setAgree] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (k, v) => {
    setAuthError('')
    setFieldErrors(e => ({ ...e, [k]: '' }))
    setForm(f => ({ ...f, [k]: v }))
  }

  useEffect(() => {
    setForm(f => ({ ...f, role: initialRole }))
  }, [initialRole])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required.'
    if (!form.email.includes('@')) errs.email = 'Enter a valid email address.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.'
    if (form.role === 'seller') {
      if (!form.phone?.trim()) errs.phone = 'Phone number is required for seller verification.'
      if (!form.nic_number?.trim()) errs.nic_number = 'NIC or Passport number is required.'
    }
    if (!agree) errs.agree = 'You must agree to the terms.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const ok = await register(form)
    setLoading(false)
    if (ok) onNavigate(form.role === 'seller' ? 'seller-dashboard' : 'home')
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#E24B4A', '#EF9F27', '#1D9E75', '#0F6E56'][strength]

  return (
    <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) onNavigate('home') }}>
      <div className="auth-card auth-card--wide">

        {/* Close */}
        <button className="auth-close" onClick={() => onNavigate('home')} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>KNW PRO REALTOR</span>
          </div>
          <h1 className="auth-title">{t('auth.createAccount')}</h1>
          <p className="auth-sub">{t('auth.createSub')}</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          {roles.map(r => (
            <button
              key={r.value} type="button"
              className={`role-btn${form.role === r.value ? ' active' : ''}`}
              onClick={() => set('role', r.value)}
            >
              <span className="role-label">{r.value === 'buyer' ? '🏠 ' : '🏷️ '}{t(`auth.${r.labelKey}`)}</span>
              <span className="role-desc">{t(`auth.${r.descKey}`)}</span>
            </button>
          ))}
        </div>

        {/* Social */}
        <div className="auth-socials">
          <button className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </button>
        </div>

        <div className="auth-divider"><span>or register with email</span></div>

        {/* Error */}
        {authError && (
          <div className="auth-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {authError}
          </div>
        )}

        {/* Form — two column on wide */}
        <form className="auth-form register-grid" onSubmit={handleSubmit} noValidate>

          {/* Full name */}
          <div className="field-group">
            <label htmlFor="reg-name">{t('auth.fullName')}</label>
            <div className={`field-wrap${fieldErrors.name ? ' field-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input id="reg-name" type="text" placeholder="Kamal Perera"
                value={form.name} onChange={e => set('name', e.target.value)}
                autoComplete="name" />
            </div>
            {fieldErrors.name && <p className="field-err-msg">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div className="field-group">
            <label htmlFor="reg-email">{t('auth.email')}</label>
            <div className={`field-wrap${fieldErrors.email ? ' field-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input id="reg-email" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                autoComplete="email" />
            </div>
            {fieldErrors.email && <p className="field-err-msg">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="reg-password">{t('auth.password')}</label>
            <div className={`field-wrap${fieldErrors.password ? ' field-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input id="reg-password" type={showPass ? 'text' : 'password'}
                placeholder={t('auth.minPassword')}
                value={form.password} onChange={e => set('password', e.target.value)}
                autoComplete="new-password" />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Hide' : 'Show'}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {form.password && (
              <div className="strength-bar">
                {[1,2,3,4].map(i => (
                  <div key={i} className="strength-seg"
                    style={{ background: i <= strength ? strengthColor : 'var(--gray-200)' }} />
                ))}
                <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {fieldErrors.password && <p className="field-err-msg">{fieldErrors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="field-group">
            <label htmlFor="reg-confirm">{t('auth.confirmPassword')}</label>
            <div className={`field-wrap${fieldErrors.confirm ? ' field-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <input id="reg-confirm" type={showPass ? 'text' : 'password'}
                placeholder={t('auth.repeatPassword')}
                value={form.confirm} onChange={e => set('confirm', e.target.value)}
                autoComplete="new-password" />
            </div>
            {fieldErrors.confirm && <p className="field-err-msg">{fieldErrors.confirm}</p>}
          </div>

          {/* Seller Document & Identity Verification Fields */}
          {form.role === 'seller' && (
            <>
              <div className="field-group field-full" style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '12px',
                color: '#166534',
                lineHeight: 1.45,
              }}>
                <strong>🛡️ Seller Verification Notice:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#15803d' }}>
                  All seller accounts are submitted to Admin for manual identity verification. Admin must review and approve your ID document before you can publish properties.
                </p>
              </div>

              {/* Phone */}
              <div className="field-group">
                <label htmlFor="reg-phone">Contact Phone *</label>
                <div className={`field-wrap${fieldErrors.phone ? ' field-error' : ''}`}>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                  />
                </div>
                {fieldErrors.phone && <p className="field-err-msg">{fieldErrors.phone}</p>}
              </div>

              {/* NIC / Passport Number */}
              <div className="field-group">
                <label htmlFor="reg-nic">NIC or Passport No *</label>
                <div className={`field-wrap${fieldErrors.nic_number ? ' field-error' : ''}`}>
                  <input
                    id="reg-nic"
                    type="text"
                    placeholder="200012345678 or N1234567"
                    value={form.nic_number}
                    onChange={e => set('nic_number', e.target.value)}
                  />
                </div>
                {fieldErrors.nic_number && <p className="field-err-msg">{fieldErrors.nic_number}</p>}
              </div>

              {/* Residential / Business Address */}
              <div className="field-group field-full">
                <label htmlFor="reg-address">Registered Address (Optional)</label>
                <div className="field-wrap">
                  <input
                    id="reg-address"
                    type="text"
                    placeholder="No. 45, Galle Road, Colombo 03"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                  />
                </div>
              </div>

              {/* NIC Document Upload */}
              <div className="field-group field-full">
                <label htmlFor="reg-document">Upload NIC or Passport Copy (PDF / JPG / PNG)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    id="reg-document"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={e => set('nic_document', e.target.files?.[0] || null)}
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px',
                      background: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    {form.nic_document ? `Selected: ${form.nic_document.name}` : 'Admin will inspect this document to approve your seller profile.'}
                  </small>
                </div>
              </div>
            </>
          )}

          {/* Terms — full width */}
          <div className="field-group field-full">
            <label className={`checkbox-label${fieldErrors.agree ? ' checkbox-label--err' : ''}`}>
              <input type="checkbox" checked={agree} onChange={e => {
                setFieldErrors(e2 => ({ ...e2, agree: '' }))
                setAgree(e.target.checked)
              }} />
              <span>
                {t('auth.terms')}
              </span>
            </label>
            {fieldErrors.agree && <p className="field-err-msg">{fieldErrors.agree}</p>}
          </div>

          <button type="submit" className="auth-submit field-full" disabled={loading}>
            {loading
              ? <><span className="spinner" /> {t('auth.creating')}</>
              : t('auth.submitRegister')
            }
          </button>
        </form>

        <p className="auth-switch">
          {t('auth.haveAccount')}{' '}
          <button onClick={() => onNavigate('login')}>{t('auth.signIn')}</button>
        </p>
      </div>
    </div>
  )
}
