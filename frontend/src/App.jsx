import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import KnwLegalBot from './components/KnwLegalBot'

// Home sections
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import FeaturedProperties from './components/FeaturedProperties'
import TopSellingAreas from './components/TopSellingAreas'
import HomeAbout from './components/HomeAbout'
import HomeReviews from './components/HomeReviews'
import LegalAdvice from './components/LegalAdvice'
import ForeignBuyers from './components/ForeignBuyers'
import CallToAction from './components/CallToAction'

// Auth modals
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Full pages
import BlogPage    from './pages/BlogPage'
import ReviewsPage from './pages/ReviewsPage'
import AboutPage   from './pages/AboutPage'
import SellerPage  from './pages/SellerPage'
import AdminDashboard from './pages/AdminDashboard'
import LegalPage from './pages/LegalPage'
import LawyerDashboard from './pages/LawyerDashboard'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import SellerDashboard from './pages/SellerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'

import './index.css'

const pagePaths = {
  home: '/',
  sell: '/sell',
  blog: '/blog',
  reviews: '/reviews',
  about: '/about',
  legal: '/legal',
  properties: '/properties',
  sellerDashboard: '/seller-dashboard',
  buyerDashboard: '/buyer-dashboard',
  admin: '/admin',
  lawyer: '/lawyer',
}

function getInitialPage() {
  const currentPath = window.location.pathname
  if (currentPath.startsWith('/property/')) return 'propertyDetail'
  if (['/buyer', '/buyer-dashboard', '/buyer-hub'].includes(currentPath)) return 'buyerDashboard'
  if (['/seller', '/seller-dashboard'].includes(currentPath)) return 'sellerDashboard'
  if (['/lawyer', '/lawyer-dashboard'].includes(currentPath)) return 'lawyer'
  const match = Object.entries(pagePaths).find(([, path]) => path === currentPath)
  if (match) {
    if (match[0] === 'home') {
      try {
        const saved = window.localStorage.getItem('KNW PRO REALTOR User')
        if (saved) {
          const u = JSON.parse(saved)
          if (['admin', 'staff'].includes(u?.role)) return 'admin'
          if (u?.role === 'lawyer') return 'lawyer'
        }
      } catch {}
    }
    return match[0]
  }
  return 'home'
}

function HomePage({ onNavigate }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <StatsBar />
      <TopSellingAreas onNavigate={onNavigate} />
      <FeaturedProperties onNavigate={onNavigate} />
      <HomeAbout onNavigate={onNavigate} />
      <HomeReviews onNavigate={onNavigate} />
      <LegalAdvice onNavigate={onNavigate} />
      <ForeignBuyers />
      <CallToAction onNavigate={onNavigate} />
    </>
  )
}

function AuthGuardPrompt({ page, onNavigate }) {
  const info = {
    sell: {
      title: 'Seller Account Required',
      desc: 'To list a property, manage seller drafts, and receive verified buyer inquiries, please sign in or register a seller account.',
      role: 'seller',
      cta: 'Create Seller Account',
    },
    legal: {
      title: 'Member Access - Legal Advice Centre',
      desc: 'Our Sri Lanka property law guides and lawyer consultation bookings are exclusively available for registered members. Please sign in or create a free account to continue.',
      role: 'buyer',
      cta: 'Create Free Account',
    },
    blog: {
      title: 'Member Access - Property & Legal Blog',
      desc: 'To read our latest property market guides, investment insights, and legal updates, please sign in or create a free account.',
      role: 'buyer',
      cta: 'Create Free Account',
    },
    buyerDashboard: {
      title: 'Buyer & Investor Account Required',
      desc: 'To access your shortlisted properties, verified bank dossiers, lawyer video consultations, and physical site inspections, please sign in or create a free account.',
      role: 'buyer',
      cta: 'Create Free Account',
    },
  }[page] || {
    title: 'Sign In Required',
    desc: 'Please sign in or create an account to view this section.',
    role: 'buyer',
    cta: 'Create Free Account',
  }

  return (
    <main className="container" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: '520px', width: '100%', background: '#ffffff', borderRadius: '16px', padding: '44px 32px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 style={{ fontSize: '23px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '12px' }}>
          {info.title}
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '28px' }}>
          {info.desc}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '12px 20px', fontSize: '15px', fontWeight: '600' }}
            onClick={() => onNavigate('login')}
          >
            Sign in to your account
          </button>
          <button
            style={{ width: '100%', padding: '12px 20px', fontSize: '15px', fontWeight: '600', background: 'var(--gray-50)', color: 'var(--gray-900)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', cursor: 'pointer', transition: 'background 0.15s' }}
            onClick={() => onNavigate('register', { role: info.role })}
          >
            {info.cta}
          </button>
          <button
            style={{ background: 'transparent', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', padding: '8px', fontSize: '14px', marginTop: '4px' }}
            onClick={() => onNavigate('home')}
          >
            ← Return to Homepage
          </button>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  const { user } = useAuth()
  const [page, setPage] = useState(getInitialPage)
  const [registerRole, setRegisterRole] = useState('buyer')

  // Scroll to top on page change
  const navigate = (p, options = {}) => {
    if (p === 'buyer' || p === 'buyer-dashboard' || p === 'buyerDashboard') p = 'buyerDashboard'
    if (p === 'seller' || p === 'seller-dashboard' || p === 'sellerDashboard') p = 'sellerDashboard'
    if (p === 'register') {
      setRegisterRole(options.role || 'buyer')
    }
    setPage(p)
    const path = pagePaths[p] || pagePaths.home
    const nextPath = p === 'propertyDetail' && options.id ? `/property/${options.id}` : path
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ page: p }, '', nextPath)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const syncPage = () => setPage(getInitialPage())
    window.addEventListener('popstate', syncPage)
    return () => window.removeEventListener('popstate', syncPage)
  }, [])

  return (
    <div className="app">
      {/* Admin Mode Persistent Top Banner when viewing public site */}
      {user && ['admin', 'staff'].includes(user.role) && page !== 'admin' && (
        <div className="admin-site-preview-banner">
          <div className="container admin-site-preview-banner__inner">
            <span>
              👑 <strong>Administrator Mode:</strong> You are currently previewing the public website.
            </span>
            <button
              type="button"
              className="admin-preview-return-btn"
              onClick={() => navigate('admin')}
            >
              ⚙️ Return to Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Lawyer Mode Persistent Top Banner when viewing public site */}
      {user && user.role === 'lawyer' && page !== 'lawyer' && (
        <div className="admin-site-preview-banner" style={{ background: '#0f172a' }}>
          <div className="container admin-site-preview-banner__inner">
            <span>
              ⚖️ <strong>Lawyer Workspace:</strong> You are currently previewing the public website.
            </span>
            <button
              type="button"
              className="admin-preview-return-btn"
              style={{ background: '#2563eb', color: '#fff', border: 'none' }}
              onClick={() => navigate('lawyer')}
            >
              ⚖️ Return to Lawyer Profile
            </button>
          </div>
        </div>
      )}

      {!['admin', 'lawyer'].includes(page) && <Navbar onNavigate={navigate} currentPage={page} />}

      {/* Auth modals — overlay on any page */}
      {page === 'login'    && <LoginPage    onNavigate={navigate} />}
      {page === 'register' && <RegisterPage onNavigate={navigate} initialRole={registerRole} />}

      {/* Page content */}
      {(page === 'home' || page === 'login' || page === 'register') && (
        <HomePage onNavigate={navigate} />
      )}
      {page === 'blog' && (
        user ? <BlogPage onNavigate={navigate} /> : <AuthGuardPrompt page="blog" onNavigate={navigate} />
      )}
      {page === 'reviews' && <ReviewsPage onNavigate={navigate} />}
      {page === 'about'   && <AboutPage   onNavigate={navigate} />}
      {page === 'sell' && (
        user ? <SellerPage onNavigate={navigate} /> : <AuthGuardPrompt page="sell" onNavigate={navigate} />
      )}
      {page === 'legal' && (
        user ? <LegalPage onNavigate={navigate} /> : <AuthGuardPrompt page="legal" onNavigate={navigate} />
      )}
      {page === 'properties' && <Properties onNavigate={navigate} />}
      {page === 'propertyDetail' && <PropertyDetail onNavigate={navigate} />}
      {page === 'sellerDashboard' && (
        user ? <SellerDashboard onNavigate={navigate} /> : <AuthGuardPrompt page="sell" onNavigate={navigate} />
      )}
      {(page === 'buyerDashboard' || page === 'buyer') && (
        user ? <BuyerDashboard onNavigate={navigate} /> : <AuthGuardPrompt page="buyerDashboard" onNavigate={navigate} />
      )}
      {page === 'admin'   && <AdminDashboard onNavigate={navigate} />}
      {page === 'lawyer'  && <LawyerDashboard onNavigate={navigate} />}

      {!['admin', 'lawyer'].includes(page) && <Footer onNavigate={navigate} />}
      {!['admin', 'lawyer'].includes(page) && user && <KnwLegalBot onNavigate={navigate} />}
    </div>
  )
}
