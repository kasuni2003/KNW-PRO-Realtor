import axios from 'axios'
import { useEffect, useState } from 'react'
import './ReviewsPage.css'

const reviewFilters = ['All Reviews', '5 Stars', '4 Stars', 'Foreign Buyers', 'Local Buyers', 'Sellers']
const emptyReviewForm = { name: '', email: '', country: '', rating: 5, type: 'buyer', title: '', comment: '' }

const reviews = [
  {
    id: 1,
    name: 'Sarah Thompson',
    country: 'United Kingdom',
    flag: '🇬🇧',
    type: 'Foreign Buyers',
    stars: 5,
    role: 'Bought beachfront land in Mirissa',
    date: 'March 2026',
    avatar: 'ST',
    avatarBg: '#E6F1FB',
    avatarColor: '#185FA5',
    review: 'KNW PRO REALTOR made buying property in Sri Lanka as a foreigner incredibly straightforward. The team guided us through the FCEPA currency rules, arranged a lawyer who verified the title, and was available on WhatsApp throughout. We found our dream plot in just three weeks. Absolutely outstanding service.',
    verified: true,
    property: 'Beachfront land, Matara District',
    helpful: 24,
  },
  {
    id: 2,
    name: 'Kamal Bandara',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    type: 'Local Buyers',
    stars: 5,
    role: 'First-time home buyer',
    date: 'April 2026',
    avatar: 'KB',
    avatarBg: '#E1F5EE',
    avatarColor: '#0F6E56',
    review: 'As a first-time buyer I was nervous about the whole process. The staff at KNW PRO REALTOR explained every step in Sinhala and English. They connected me with a reliable lawyer and made sure the title was clean before I signed anything. I am now a proud homeowner in Nugegoda. Cannot thank them enough.',
    verified: true,
    property: '3BR house, Colombo District',
    helpful: 18,
  },
  {
    id: 3,
    name: 'Hans Müller',
    country: 'Germany',
    flag: '🇩🇪',
    type: 'Foreign Buyers',
    stars: 5,
    role: 'Invested in eco villa, Ella',
    date: 'February 2026',
    avatar: 'HM',
    avatarBg: '#FAEEDA',
    avatarColor: '#854F0B',
    review: 'I found KNW PRO REALTOR through a Google search while researching Sri Lanka investment properties from Germany. From the very first video call the team was professional and responsive. They handled all the legal checks remotely, arranged virtual tours, and the whole purchase was completed in 8 weeks. Exceptional.',
    verified: true,
    property: 'Eco villa, Badulla District',
    helpful: 31,
  },
  {
    id: 4,
    name: 'Dilani Rajapaksa',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    type: 'Sellers',
    stars: 5,
    role: 'Sold land in Kandy',
    date: 'May 2026',
    avatar: 'DR',
    avatarBg: '#FBEAF0',
    avatarColor: '#993556',
    review: 'I listed my land on KNW PRO REALTOR and had qualified buyers inquiring within 48 hours. The staff reviewed my documents quickly and my listing went live the same day. The platform found a serious buyer within two weeks and the whole transaction was smooth. I will definitely use them again.',
    verified: true,
    property: '15 perches, Kandy District',
    helpful: 12,
  },
  {
    id: 5,
    name: 'Pradeep Wickramasinghe',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    type: 'Local Buyers',
    stars: 4,
    role: 'Purchased apartment in Colombo',
    date: 'January 2026',
    avatar: 'PW',
    avatarBg: '#E1F5EE',
    avatarColor: '#0F6E56',
    review: 'Very good experience overall. The website was easy to use and I found my apartment in Colombo 7 through LankaRealty. The agent was knowledgeable and the legal advice section on the website was very helpful. Gave 4 stars only because response time could be a little faster on weekends.',
    verified: true,
    property: '2BR apartment, Colombo 7',
    helpful: 9,
  },
  {
    id: 6,
    name: 'Mei Lin',
    country: 'Singapore',
    flag: '🇸🇬',
    type: 'Foreign Buyers',
    stars: 5,
    role: 'Bought apartment in Galle',
    date: 'April 2026',
    avatar: 'ML',
    avatarBg: '#E6F1FB',
    avatarColor: '#185FA5',
    review: 'The foreign buyer guide on KNW PRO REALTOR\'s website gave me so much confidence before I even contacted the team. Once I did, they were amazing — connected me with a Colombo property lawyer, arranged all due diligence, and answered every question patiently. Bought a sea-view apartment and absolutely love it.',
    verified: true,
    property: 'Sea-view apartment, Galle District',
    helpful: 27,
  },
  {
    id: 7,
    name: 'Roshan Perera',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    type: 'Sellers',
    stars: 4,
    role: 'Listed and sold house in Negombo',
    date: 'March 2026',
    avatar: 'RP',
    avatarBg: '#FAEEDA',
    avatarColor: '#854F0B',
    review: 'Selling my late father\'s house through KNW PRO REALTOR was much easier than I expected. The document review took a few days but once approved my listing got great visibility. The team was respectful and professional throughout a difficult time. Would recommend to anyone selling property.',
    verified: false,
    property: 'House, Negombo',
    helpful: 7,
  },
  {
    id: 8,
    name: 'James O\'Brien',
    country: 'Australia',
    flag: '🇦🇺',
    type: 'Foreign Buyers',
    stars: 5,
    role: 'Retired to Sri Lanka',
    date: 'February 2026',
    avatar: 'JO',
    avatarBg: '#E1F5EE',
    avatarColor: '#0F6E56',
    review: 'My wife and I decided to retire to Sri Lanka and KNW PRO REALTOR was recommended by a friend in Colombo. The team understood our specific needs as foreign retirees, explained the 99-year lease option clearly, and found us a beautiful villa in Unawatuna. The legal team was thorough and we felt completely protected.',
    verified: true,
    property: 'Villa, Galle District',
    helpful: 33,
  },
]

function StarRating({ stars, size = 16 }) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= stars ? '#F59E0B' : '#D1D5DB' }}>★</span>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.review.length > 220
  const text = isLong && !expanded ? review.review.slice(0, 220) + '…' : review.review

  return (
    <div className="review-card">
      <div className="review-card__top">
        <div className="review-card__avatar" style={{ background: review.avatarBg, color: review.avatarColor }}>
          {review.avatar}
        </div>
        <div className="review-card__info">
          <div className="review-card__name">
            {review.name}
            <span className="review-card__flag">{review.flag}</span>
            {review.verified && <span className="verified-badge">✓ Verified</span>}
          </div>
          <div className="review-card__role">{review.role}</div>
          <div className="review-card__meta">{review.country} · {review.date}</div>
        </div>
        <StarRating stars={review.stars} />
      </div>

      <p className="review-card__text">
        "{text}"
        {isLong && (
          <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
            {expanded ? ' Show less' : ' Read more'}
          </button>
        )}
      </p>

      <div className="review-card__property">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        {review.property}
      </div>

      <div className="review-card__helpful">
        <button className="helpful-btn">👍 Helpful ({review.helpful})</button>
      </div>
    </div>
  )
}

export default function ReviewsPage({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('All Reviews')
  const [items, setItems] = useState(reviews)
  const [form, setForm] = useState(emptyReviewForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await axios.get('/api/reviews')
        const liveReviews = (res.data.data || []).map(toReviewCard)
        if (liveReviews.length > 0) {
          const liveIds = new Set(liveReviews.map(r => r.id))
          const remainingCurated = reviews.filter(r => !liveIds.has(r.id))
          setItems([...liveReviews, ...remainingCurated])
        }
      } catch {
        setItems(reviews)
      }
    }
    loadReviews()
  }, [])

  const filtered = items.filter(r => {
    if (activeFilter === 'All Reviews') return true
    if (activeFilter === '5 Stars') return r.stars === 5
    if (activeFilter === '4 Stars') return r.stars === 4
    return r.type === activeFilter
  })

  const avgRating = items.length ? (items.reduce((a, r) => a + r.stars, 0) / items.length).toFixed(1) : '0.0'
  const fiveStarPct = items.length ? Math.round(items.filter(r => r.stars === 5).length / items.length * 100) : 0

  async function submitReview(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const res = await axios.post('/api/reviews', form)
      setMessage(res.data.message || 'Thank you! Your review has been submitted and published.')
      setForm(emptyReviewForm)

      const refreshed = await axios.get('/api/reviews').catch(() => null)
      if (refreshed?.data?.data) {
        const live = refreshed.data.data.map(toReviewCard)
        const liveIds = new Set(live.map(r => r.id))
        const remainingCurated = reviews.filter(r => !liveIds.has(r.id))
        setItems([...live, ...remainingCurated])
      }
    } catch (err) {
      setError(getApiError(err, 'Could not submit review.'))
    }
  }

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page-hero page-hero--reviews">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span>›</span>
            <span>Customer Reviews</span>
          </div>
          <h1 className="page-hero__title">What Our Customers Say</h1>
          <p className="page-hero__sub">Real experiences from buyers, sellers, and investors across Sri Lanka and around the world</p>

          {/* Rating summary */}
          <div className="rating-summary">
            <div className="rating-summary__score">
              <span className="big-rating">{avgRating}</span>
              <StarRating stars={5} size={22} />
              <span className="rating-count">Based on {items.length} reviews</span>
            </div>
            <div className="rating-bars">
              {[5,4,3,2,1].map(s => {
                const count = items.filter(r => r.stars === s).length
                const pct = items.length ? Math.round(count / items.length * 100) : 0
                return (
                  <div key={s} className="rating-bar-row">
                    <span className="rating-bar-label">{s}★</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rating-bar-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container reviews-body">
        {/* Trust badges */}
        <div className="trust-badges">
          <div className="trust-badge">
            <span className="trust-badge__icon">⭐</span>
            <span className="trust-badge__num">{avgRating}/5</span>
            <span className="trust-badge__lbl">Average rating</span>
          </div>
          <div className="trust-badge">
            <span className="trust-badge__icon">✅</span>
            <span className="trust-badge__num">{fiveStarPct}%</span>
            <span className="trust-badge__lbl">5-star reviews</span>
          </div>
          <div className="trust-badge">
            <span className="trust-badge__icon">🌍</span>
            <span className="trust-badge__num">18+</span>
            <span className="trust-badge__lbl">Countries served</span>
          </div>
          <div className="trust-badge">
            <span className="trust-badge__icon">🏠</span>
            <span className="trust-badge__num">850+</span>
            <span className="trust-badge__lbl">Properties sold</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="category-bar" style={{ marginBottom: '28px' }}>
          {reviewFilters.map(f => (
            <button
              key={f}
              className={`cat-btn${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reviews grid */}
        <div className="reviews-grid">
          {filtered.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>

        {/* Write a review CTA */}
        <div className="write-review-box">
          <div>
            <h3>Had a great experience with LankaRealty?</h3>
            <p>Share your story and help other buyers and sellers make confident decisions.</p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('properties')}>Review a property</button>
        </div>

        <form className="review-submit-panel" onSubmit={submitReview}>
          <div className="review-submit-panel__head">
            <h3>Write a public review</h3>
            <p>Share your honest experience on our platform.</p>
          </div>
          {(message || error) && <div className={`review-message ${error ? 'review-message--error' : ''}`}>{error || message}</div>}
          <div className="review-submit-grid">
            <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
            <label>Country<input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Sri Lanka" /></label>
            <label>Rating
              <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Bad</option>
              </select>
            </label>
            <label>Type
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="buyer">Local buyer</option>
                <option value="seller">Seller</option>
                <option value="foreign_buyer">Foreign buyer</option>
                <option value="lawyer_client">Lawyer client</option>
              </select>
            </label>
            <label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Professional and helpful" /></label>
            <label className="review-submit-wide">Review<textarea rows="4" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} required /></label>
          </div>
          <button className="btn-primary" type="submit">Submit</button>
        </form>
      </div>
    </div>
  )
}

function toReviewCard(review) {
  const typeLabels = {
    buyer: 'Local Buyers',
    seller: 'Sellers',
    foreign_buyer: 'Foreign Buyers',
    lawyer_client: 'Local Buyers',
  }

  const initials = review.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    id: review.id,
    name: review.name,
    country: review.country || 'Sri Lanka',
    flag: '',
    type: typeLabels[review.type] || 'Local Buyers',
    stars: Number(review.rating),
    role: review.role_label || review.title || 'Customer review',
    date: review.approved_at ? new Date(review.approved_at).toLocaleDateString() : new Date(review.created_at).toLocaleDateString(),
    avatar: initials || 'KR',
    avatarBg: '#E1F5EE',
    avatarColor: '#0F6E56',
    review: review.comment,
    verified: Boolean(review.verified),
    property: review.property ? `${review.property.property_type} in ${review.property.district}` : 'KNW PRO REALTOR service',
    helpful: review.helpful_count || 0,
  }
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}
