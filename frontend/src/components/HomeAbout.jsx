import './HomeAbout.css'

const reasons = [
  {
    label: 'Verified listings',
    title: 'Real property details before you visit',
    text: 'Listings are reviewed with location, visit options, images, and seller details so buyers can compare with confidence.',
  },
  {
    label: 'Legal support',
    title: 'Lawyer guidance when it matters',
    text: 'Buyers and sellers can move from property discovery to title checks, advice, and document support in one place.',
  },
  {
    label: 'Seller tools',
    title: 'Modern selling workflow',
    text: 'Sellers can submit properties, upload images and payment slips, share maps, and manage listing requests online.',
  },
]

const proofPoints = ['Buyer friendly search', 'Seller dashboard', 'Admin review flow', 'Property lawyer access']

export default function HomeAbout({ onNavigate }) {
  return (
    <section className="home-about-section">
      <div className="container">
        <div className="home-about-layout">
          <div className="home-about-copy">
            <span className="home-about-eyebrow">About KNW PRO REALTOR</span>
            <h2 className="home-about-title">A clearer way to buy and sell property in Sri Lanka</h2>
            <p className="home-about-text">
              We bring listings, seller requests, legal guidance, and buyer communication into one
              simple real estate experience. The goal is to make every step feel organized,
              transparent, and easier to trust.
            </p>

            <div className="home-about-actions">
              <button className="btn-primary" onClick={() => onNavigate?.('about')}>
                Learn about us
              </button>
              <button className="home-about-link" onClick={() => onNavigate?.('sell')}>
                Start selling
              </button>
            </div>
          </div>

          <div className="home-about-panel" aria-label="Platform highlights">
            <div className="home-about-score">
              <span>95%</span>
              <small>Listing readiness focus</small>
            </div>
            <div className="home-about-proof">
              {proofPoints.map(point => (
                <span key={point}>{point}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="home-about-grid">
          {reasons.map(reason => (
            <article className="home-about-card" key={reason.title}>
              <span>{reason.label}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
