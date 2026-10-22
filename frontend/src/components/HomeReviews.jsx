import './HomeReviews.css'

const reviews = [
  {
    name: 'Nadeesha Perera',
    role: 'First-time buyer',
    quote:
      'The property details were easy to understand and the legal guidance helped me know what to check before visiting.',
  },
  {
    name: 'Michael Fernando',
    role: 'Overseas buyer',
    quote:
      'I could compare properties, understand the buying process, and get support without feeling lost between different contacts.',
  },
  {
    name: 'S. Wijesinghe',
    role: 'Property seller',
    quote:
      'Submitting my listing with photos, map details, visit dates, and payment proof made the selling process feel organized.',
  },
]

export default function HomeReviews({ onNavigate }) {
  return (
    <section className="home-reviews-section">
      <div className="container">
        <div className="section-header home-reviews-header">
          <div>
            <h2 className="section-title">Trusted by property buyers and sellers</h2>
            <p className="section-subtitle">Simple, clear experiences from people using the platform</p>
          </div>
          <button className="view-all" onClick={() => onNavigate?.('reviews')}>
            View reviews
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <div className="home-reviews-layout">
          <div className="home-reviews-summary">
            <span className="home-reviews-rating">4.8</span>
            <div>
              <strong>Excellent service experience</strong>
              <p>Based on buyer, seller, and overseas property support feedback.</p>
            </div>
          </div>

          <div className="home-reviews-grid">
            {reviews.map(review => (
              <article className="home-review-card" key={review.name}>
                <div className="home-review-stars" aria-label="Five star review">★★★★★</div>
                <p className="home-review-quote">"{review.quote}"</p>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
