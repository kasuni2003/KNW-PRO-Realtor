import './Footer.css'

export default function Footer({ onNavigate }) {
  const nav = (p) => { onNavigate(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <button className="footer__logo" onClick={() => nav('home')}>
              <div className="footer__logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span>KNW PRO REALTOR</span>
            </button>
            <p className="footer__brand-desc">
              Sri Lanka's trusted marketplace for land, apartments, and houses — with full
              legal support for local and foreign buyers across all 25 districts.
            </p>
            <div className="footer__contact">
              <span>📞 +94 11 234 5678</span>
              <span>✉️ knwprorealtor@gmail.lk</span>
              <span>📍 delkanda,Nugegoda, Sri Lanka</span>
            </div>
          </div>

          {/* Properties */}
          <div className="footer__col">
            <h4 className="footer__col-heading">Properties</h4>
            <button className="footer__col-link" onClick={() => nav('home')}>Buy land</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Buy apartments</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Buy houses</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Commercial</button>
          </div>

          {/* Legal */}
          <div className="footer__col">
            <h4 className="footer__col-heading">Legal</h4>
            <button className="footer__col-link" onClick={() => nav('home')}>Foreign ownership</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Title verification</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Taxes &amp; fees</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Book a lawyer</button>
          </div>

          {/* Company */}
          <div className="footer__col">
            <h4 className="footer__col-heading">Company</h4>
            <button className="footer__col-link" onClick={() => nav('about')}>About us</button>
            <button className="footer__col-link" onClick={() => nav('blog')}>Blog</button>
            <button className="footer__col-link" onClick={() => nav('reviews')}>Reviews</button>
            <button className="footer__col-link" onClick={() => nav('home')}>Contact</button>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 KNW PRO REALTOR (Pvt) Ltd · Colombo, Sri Lanka · All rights reserved</p>
          <div className="footer__bottom-socials">
            <span>FB</span><span>IG</span><span>LI</span><span>YT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
