import React from 'react'
import './ExpresswayConnectivity.css'

export default function ExpresswayConnectivity({ property }) {
  if (!property) return null

  const district = (property.district || 'Colombo').toLowerCase()

  // Proximity profiles by district
  const defaultProfiles = {
    colombo: {
      expressway: property.expressway_name || 'E03 Katunayake Airport Expressway / E02 Outer Circular',
      expresswayMins: property.expressway_mins || 12,
      airport: 'Bandaranaike Int Airport (BIA) · 32 mins (Expressway)',
      hospital: 'Lanka Hospitals & Asiri Medical · 6 mins',
      school: 'Colombo International (CIS) & British School · 8 mins',
      transit: 'Colombo Fort Railway Terminal · 12 mins',
      supermarket: 'Keells Super & Glomark Gourmet · 3 mins',
      commuteText: 'Direct seamless connection to Colombo Port City & business district via Port Access Elevated Highway.',
      score: '9.8',
    },
    galle: {
      expressway: property.expressway_name || 'E01 Southern Expressway (Pinnaduwa Interchange)',
      expresswayMins: property.expressway_mins || 10,
      airport: 'BIA Airport · 1h 45m via E01 | Koggala Domestic · 14 mins',
      hospital: 'Karapitiya National Teaching Hospital · 12 mins',
      school: 'Thomas Gall International & Richmond College · 10 mins',
      transit: 'Galle Central Railway & Heritage Port · 6 mins',
      supermarket: 'Cargills Food City & Keells Galle · 4 mins',
      commuteText: 'Direct non-stop commute to Colombo Fort: 58 mins via E01 Southern Expressway.',
      score: '9.4',
    },
    matara: {
      expressway: property.expressway_name || 'E01 Southern Expressway (Kokmaduwa / Godagama)',
      expresswayMins: property.expressway_mins || 12,
      airport: 'Mattala Int Airport · 55 mins | BIA Colombo · 1h 55m (E01)',
      hospital: 'Asiri Hospital Matara & General Hospital · 10 mins',
      school: 'St. Thomas College & Rahula College · 10 mins',
      transit: 'Weligama / Mirissa Coastal Railway · 4 mins',
      supermarket: 'Keells Weligama & Local Organic Produce · 3 mins',
      commuteText: 'Beachfront to Southern Expressway in 12 mins; reach Colombo suburbs in ~75 minutes.',
      score: '9.2',
    },
    kandy: {
      expressway: property.expressway_name || 'E04 Central Expressway (Katugastota Terminal)',
      expresswayMins: property.expressway_mins || 18,
      airport: 'Bandaranaike Int Airport (BIA) · 1h 40m via Central Expressway',
      hospital: 'Asiri Hospital Kandy & Peradeniya Teaching Hospital · 8 mins',
      school: 'Trinity College, Kingswood & Gateway College · 8 mins',
      transit: 'Kandy Heritage Railway Station · 6 mins',
      supermarket: 'Kandy City Centre (KCC) & Keells · 5 mins',
      commuteText: 'Connected to Colombo via the newly expanded Central Expressway (E04) with smooth hill traversal.',
      score: '9.0',
    },
    gampaha: {
      expressway: property.expressway_name || 'E03 Katunayake Airport Expressway & E04 Central Expressway',
      expresswayMins: property.expressway_mins || 6,
      airport: 'Bandaranaike Int Airport (BIA) · 8 mins direct',
      hospital: 'Negombo District General & Nawaloka Hospital · 8 mins',
      school: 'Lyceum International & Bandaranayake College · 6 mins',
      transit: 'Katunayake Airport Transit Hub · 6 mins',
      supermarket: 'K-Zone Ja-Ela & Arpico Supercentre · 4 mins',
      commuteText: 'The ultimate logistics nexus: 20 minutes to Colombo Fort via E03 and direct link to Central Expressway.',
      score: '9.9',
    },
    hambantota: {
      expressway: property.expressway_name || 'E01 Southern Expressway (Beliatta / Kasagala)',
      expresswayMins: property.expressway_mins || 15,
      airport: 'Mattala Rajapaksa Int Airport (MRIA) · 38 mins',
      hospital: 'Tangalle Base Hospital · 6 mins',
      school: 'Tangalle Central College & International preschool · 8 mins',
      transit: 'Beliatta Southern Railway Mainline Terminal · 12 mins',
      supermarket: 'Cargills Food City Tangalle · 5 mins',
      commuteText: 'Tranquil southern coastline connected to Colombo in 1 hour 35 mins via uninterrupted E01 expressway.',
      score: '8.8',
    },
    kalutara: {
      expressway: property.expressway_name || 'E01 Southern Expressway (Gelanigama / Welipenna)',
      expresswayMins: property.expressway_mins || 12,
      airport: 'BIA Airport · 55 mins via Outer Circular Expressway (OCH)',
      hospital: 'Nagoda Teaching Hospital Kalutara · 10 mins',
      school: 'Kalutara Vidyalaya & Holy Cross College · 8 mins',
      transit: 'Bentota / Kalutara South Coastal Railway · 6 mins',
      supermarket: 'Keells Super Bentota · 4 mins',
      commuteText: 'Prime riverfront and beach sanctuary with fast 35-minute expressway commute to southern Colombo.',
      score: '9.1',
    },
  }

  // Find matching profile or default to Colombo
  const matchedKey = Object.keys(defaultProfiles).find(k => district.includes(k)) || 'colombo'
  const profile = defaultProfiles[matchedKey]

  const expresswayText = property.expressway_proximity || `${profile.expresswayMins} mins to ${profile.expressway}`

  return (
    <section className="connectivity-box" id="connectivity-index">
      <div className="connectivity-header">
        <div className="connectivity-title-wrap">
          <h3>
            <span>🛣️</span> Expressway & Proximity Connectivity Index
          </h3>
          <p>Verified travel times to national expressways, international transport, and core amenities</p>
        </div>
        <div className="connectivity-score-badge">
          <span>Connectivity Score</span>
          <strong>{profile.score} / 10</strong>
        </div>
      </div>

      {/* Primary Expressway Transit Pill */}
      <div className="expressway-primary-card">
        <div className="expressway-primary-info">
          <span>Primary Expressway Corridor</span>
          <strong>{profile.expressway}</strong>
        </div>
        <div className="expressway-time-pill">
          🚗 {expresswayText}
        </div>
      </div>

      {/* Proximity Grid */}
      <div className="proximity-amenities-grid">
        <div className="proximity-item">
          <div className="proximity-icon">✈️</div>
          <div className="proximity-text">
            <span>Airport Proximity</span>
            <strong>{profile.airport.split('·')[0]}</strong>
            <em>{profile.airport.split('·')[1] || 'Direct Access'}</em>
          </div>
        </div>

        <div className="proximity-item">
          <div className="proximity-icon">🏥</div>
          <div className="proximity-text">
            <span>Healthcare</span>
            <strong>{profile.hospital.split('·')[0]}</strong>
            <em>{profile.hospital.split('·')[1] || 'Emergency Care'}</em>
          </div>
        </div>

        <div className="proximity-item">
          <div className="proximity-icon">🎓</div>
          <div className="proximity-text">
            <span>Premier Education</span>
            <strong>{profile.school.split('·')[0]}</strong>
            <em>{profile.school.split('·')[1] || 'Int. Curriculum'}</em>
          </div>
        </div>

        <div className="proximity-item">
          <div className="proximity-icon">🚆</div>
          <div className="proximity-text">
            <span>Rail & Transit Hub</span>
            <strong>{profile.transit.split('·')[0]}</strong>
            <em>{profile.transit.split('·')[1] || 'Mainline Access'}</em>
          </div>
        </div>

        <div className="proximity-item">
          <div className="proximity-icon">🛒</div>
          <div className="proximity-text">
            <span>Retail & Supermarket</span>
            <strong>{profile.supermarket.split('·')[0]}</strong>
            <em>{profile.supermarket.split('·')[1] || 'Daily Conveniences'}</em>
          </div>
        </div>
      </div>

      {/* Commute Summary */}
      <div className="connectivity-commute-note">
        <span>🧭</span>
        <strong>Commute Intelligence:</strong>
        <span>{profile.commuteText}</span>
      </div>
    </section>
  )
}
