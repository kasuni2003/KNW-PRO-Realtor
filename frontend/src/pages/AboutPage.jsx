import './AboutPage.css'

const stats = [
  { value: '2,400+', label: 'Active listings' },
  { value: '850+',   label: 'Properties sold' },
  { value: '18',     label: 'Countries served' },
  { value: '4.8★',   label: 'Average rating' },
]

const values = [
  {
    icon: '🤝',
    bg: '#E1F5EE',
    title: 'Trust & transparency',
    desc: 'Every listing on KNW PRO REALTOR is verified by our staff before it goes live. We check title deeds, survey plans, and seller identity so you can buy with complete confidence.',
  },
  {
    icon: '⚖️',
    bg: '#EEEDFE',
    title: 'Legal-first approach',
    desc: 'We are the only property platform in Sri Lanka with a built-in legal advice centre. Our network of certified property lawyers is available for every customer.',
  },
  {
    icon: '🌍',
    bg: '#E6F1FB',
    title: 'International reach',
    desc: 'We have helped buyers from 18 countries purchase property in Sri Lanka. Our team understands FCEPA rules, currency regulations, and the challenges foreign buyers face.',
  },
  {
    icon: '💡',
    bg: '#FAEEDA',
    title: 'Education first',
    desc: 'We believe an informed buyer is a protected buyer. Our blog, legal guides, and free consultations exist to empower customers — not just close deals.',
  },
]

const team = [
  {
    name: 'Arjuna Rajapaksa',
    title: 'Co-founder & CEO',
    emoji: '👨‍💼',
    bg: '#E1F5EE',
    bio: 'Former real estate lawyer with 15 years of experience in Sri Lankan property law. Founded LankaRealty to make property transactions safer for every buyer.',
  },
  {
    name: 'Kaushalya Nilmini Wijesinghe',
    title: 'Head of Legal',
    emoji: '⚖️',
    bg: '#EEEDFE',
    bio: 'Senior property lawyer specialising in foreign ownership and title verification. Has overseen legal compliance for over 400 property transactions.',
  },
  {
    name: 'Nimal Perera',
    title: 'Head of Operations',
    emoji: '📋',
    bg: '#E6F1FB',
    bio: 'Manages the staff review process and seller verification programme. Ensures every listing meets our strict quality standards before going live.',
  },
  {
    name: 'Chamari Silva',
    title: 'International Relations',
    emoji: '🌍',
    bg: '#FAEEDA',
    bio: 'Dedicated to helping foreign buyers navigate Sri Lanka\'s property market. Speaks English, German, and Sinhala. Has assisted buyers from 18 countries.',
  },
]

const timeline = [
  { year: '2019', event: 'KNW PRO REALTOR founded in Colombo with 12 listings and a small team of 4' },
  { year: '2020', event: 'Launched online legal advice centre — first property platform in Sri Lanka to do so' },
  { year: '2021', event: 'Expanded to cover all 25 districts. Reached 500 verified listings' },
  { year: '2022', event: 'Launched foreign buyer programme — first dedicated service for international buyers' },
  { year: '2023', event: 'Crossed 1,000 properties sold. Team grew to 28 people' },
  { year: '2024', event: 'Partnered with 6 law firms across Sri Lanka for on-demand legal consultations' },
  { year: '2026', event: 'Now serving 18 countries, 2,400+ active listings, 4.8★ customer rating' },
]

export default function AboutPage({ onNavigate }) {
  return (
    <div className="page">
      {/* ── Hero ── */}
      <div className="page-hero about-hero">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span>›</span>
            <span>About Us</span>
          </div>
          <div className="about-hero__inner">
            <div className="about-hero__text">
              <h1 className="page-hero__title">Sri Lanka's most trusted<br/>property platform</h1>
              <p className="page-hero__sub" style={{ marginBottom: 0 }}>
               KNW PRO REALTOR was built on one belief: buying and selling property should be safe, transparent,
                and accessible to everyone — whether you are in Colombo or calling from overseas.
              </p>
            </div>
            <div className="about-hero__emoji">🏝️</div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="about-stats-bar">
        <div className="container about-stats-bar__inner">
          {stats.map((s, i) => (
            <div key={i} className="about-stat">
              <span className="about-stat__val">{s.value}</span>
              <span className="about-stat__lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container about-body">

        {/* ── Story ── */}
        <section className="about-section">
          <div className="about-story">
            <div className="about-story__text">
              <span className="about-eyebrow">Our story</span>
              <h2 className="about-section__title">We started because property buying in Sri Lanka was broken</h2>
              <p>
                In 2019, our founder Arjuna Rajapaksa — a property lawyer — watched client after client
                lose money to fraudulent listings, forged title deeds, and agents with no accountability.
                He knew there had to be a better way.
              </p>
              <p>
                KNW PRO REALTOR was built from the ground up with legal verification at its core. Every seller
                is identity-checked, every listing is reviewed by our staff, and every buyer has access
                to free legal guides and certified lawyers.
              </p>
              <p>
                Today we are Sri Lanka's fastest-growing property platform, serving buyers from Colombo
                to California — with the same commitment to trust that we started with.
              </p>
            </div>
            <div className="about-story__visual">
              <div className="story-card">
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>🏠</div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '6px' }}>
                  "A safe property market for every Sri Lankan and every investor who believes in this island."
                </p>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>— Arjuna Rajapaksa, Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="about-section">
          <span className="about-eyebrow">What we stand for</span>
          <h2 className="about-section__title">Our values</h2>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-card__icon" style={{ background: v.bg }}>{v.icon}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section className="about-section">
          <span className="about-eyebrow">The people behind KNW PRO REALTOR</span>
          <h2 className="about-section__title">Meet our team</h2>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={i} className="team-card">
                <div className="team-card__avatar" style={{ background: m.bg }}>
                  {m.emoji}
                </div>
                <h3 className="team-card__name">{m.name}</h3>
                <p className="team-card__title">{m.title}</p>
                <p className="team-card__bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="about-section">
          <span className="about-eyebrow">How we got here</span>
          <h2 className="about-section__title">Our journey</h2>
          <div className="timeline">
            {timeline.map((t, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-item__left">
                  <div className="timeline-year">{t.year}</div>
                  {i < timeline.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-item__body">
                  <p className="timeline-event">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="about-cta">
          <div className="about-cta__text">
            <h2>Ready to find your property?</h2>
            <p>Join thousands of buyers and sellers who trust KNW PRO REALTOR for their most important transactions.</p>
          </div>
          <div className="about-cta__btns">
            <button className="btn-primary" onClick={() => onNavigate('register')}>Get started free</button>
            <button
              className="btn-outline-green"
              onClick={() => onNavigate('home')}
            >Browse listings</button>
          </div>
        </section>

      </div>
    </div>
  )
}
