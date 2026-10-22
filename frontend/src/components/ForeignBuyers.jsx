import './ForeignBuyers.css'

const countries = [
  { flag: '🇬🇧', name: 'UK' },
  { flag: '🇦🇺', name: 'Australia' },
  { flag: '🇺🇸', name: 'USA' },
  { flag: '🇸🇬', name: 'Singapore' },
  { flag: '🇦🇪', name: 'UAE' },
  { flag: '🇩🇪', name: 'Germany' },
  { flag: '🇯🇵', name: 'Japan' },
  { flag: '🇨🇳', name: 'China' },
]

const steps = [
  { num: '01', title: 'Check eligibility',  desc: 'Understand what foreigners can legally own in Sri Lanka.' },
  { num: '02', title: 'Open a NRFC account', desc: 'Open a Non-Resident Foreign Currency account with a Sri Lankan bank.' },
  { num: '03', title: 'Find your property',  desc: 'Browse our verified foreign-friendly listings filtered for you.' },
  { num: '04', title: 'Legal due diligence', desc: 'Our lawyers verify title, survey plans, and encumbrances.' },
  { num: '05', title: 'Complete purchase',   desc: 'Sign the deed, pay stamp duty, and register at the Land Registry.' },
]

export default function ForeignBuyers() {
  return (
    <section className="foreign-section">
      <div className="container">
        <div className="foreign-layout">
          {/* Left: text + steps */}
          <div className="foreign-left">
            <span className="foreign-eyebrow">For international buyers</span>
            <h2 className="foreign-heading">
              Buying property in Sri Lanka<br />
              <span className="foreign-heading-accent">as a foreigner?</span>
            </h2>
            <p className="foreign-sub">
              We guide international buyers through every step — from legal eligibility
              and currency regulations to title verification and registration. Our English-speaking
              team is here from day one.
            </p>

            <div className="foreign-steps">
              {steps.map(s => (
                <div key={s.num} className="foreign-step">
                  <div className="foreign-step__num">{s.num}</div>
                  <div>
                    <p className="foreign-step__title">{s.title}</p>
                    <p className="foreign-step__desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="/foreign-buyers" className="btn-primary foreign-btn">
              Read the full foreign buyer guide →
            </a>
          </div>

          {/* Right: countries card */}
          <div className="foreign-right">
            <div className="foreign-card">
              <p className="foreign-card__label">Buyers from these countries trust us</p>
              <div className="foreign-flags">
                {countries.map(c => (
                  <div key={c.name} className="foreign-flag-item">
                    <span className="foreign-flag-emoji">{c.flag}</span>
                    <span className="foreign-flag-name">{c.name}</span>
                  </div>
                ))}
              </div>
              <p className="foreign-card__more">+ 10 more countries</p>

              <div className="foreign-card__divider" />

              <div className="foreign-card__stat">
                <span className="foreign-card__stat-num">320+</span>
                <span className="foreign-card__stat-lbl">Foreign buyers assisted</span>
              </div>
              <div className="foreign-card__stat">
                <span className="foreign-card__stat-num">100%</span>
                <span className="foreign-card__stat-lbl">Legal compliance guaranteed</span>
              </div>

              <div className="foreign-card__divider" />

              <a href="/foreign-buyers#contact" className="foreign-card__cta">
                Talk to our foreign buyer team
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
