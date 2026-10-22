import { useState, useRef, useEffect } from 'react'
import './KnwLegalBot.css'

const KNOWLEDGE_BASE = [
  {
    triggers: ['foreign', 'non-citizen', 'foreigner', 'alien', 'visa', 'expat'],
    title: 'Foreign Property Ownership in Sri Lanka',
    response: `Under the Land (Restrictions on Alienation) Act No. 38 of 2014:
1. **Freehold Land:** Foreign nationals and foreign companies (over 50% foreign ownership) **cannot** purchase freehold land directly.
2. **Apartments / Condos:** Foreign citizens CAN purchase freehold condominium apartments situated on or above the **4th floor**.
3. **Leaseholds:** Non-citizens can lease private or state land up to **99 years**.
4. **Funding:** All funds must be transferred into Sri Lanka through an approved **Inward Investment Account (IIA)** or permitted foreign currency banking channel.
Would you like to schedule a formal legal consultation with one of our certified property lawyers?`,
  },
  {
    triggers: ['bim saviya', 'title registration', 'act 21', 'bim', 'saviya'],
    title: 'Bim Saviya (Title Registration System)',
    response: `**Bim Saviya (Registration of Title Act No. 21 of 1998):**
- Unlike the traditional deed system which registers 'documents', Bim Saviya registers 'ownership' with a state-guaranteed Certificate of Title.
- **First-Class Title (Category A):** Guaranteed title with no encumbrance.
- **Twelve-Year Title (Category B):** Converts to absolute title after 12 years if no disputes arise.
- When buying Bim Saviya land, always inspect the Cadastral Survey Plan registered at the Land Registry.`,
  },
  {
    triggers: ['stamp duty', 'tax', 'rates', 'fees', 'closing cost', 'duty'],
    title: 'Stamp Duty & Closing Taxes in Sri Lanka',
    response: `**Stamp Duty on Property Purchases:**
- **First Rs. 100,000:** 3% (Rs. 3,000)
- **Balance value:** 4%
- **Notary / Legal Fees:** Typically 1% to 1.5% of declared deed value.
- **Land Registry Registration Fee:** Approx 0.1% - 0.2%.
- **Local Council Assessment Rates:** Annual rate determined by the Municipal/Urban Council (MC/UC/PS).
You can also use our built-in **Stamp Duty Calculator** from the tools menu to calculate exact amounts for your budget!`,
  },
  {
    triggers: ['deed chain', '30 year', 'title check', 'search report', 'caveat', 'encumbrance'],
    title: '30-Year Title Search Due Diligence',
    response: `Before paying any advance on Sri Lankan property:
1. **Folio Search:** Have a notary or title lawyer search the Day Book and Folio volumes at the relevant Land Registry for at least **30 years** back.
2. **Prior Deeds:** Verify all deeds of gift, partition decrees, or inheritance transfers for conditions (e.g. life interests, minors' rights).
3. **Caveats & Mortgages:** Check if any registered bank mortgages, court lis pendens, or caveats exist.
4. **Survey Plan:** Ensure the surveyor's plan is approved by the local council and matches physical ground boundaries.`,
  },
  {
    triggers: ['lawyer', 'consultation', 'book', 'attorney', 'notary', 'appointment'],
    title: 'Certified Property Lawyers Consultation',
    response: `KNW PRO REALTOR maintains an active panel of verified, licensed Sri Lankan property attorneys and notaries.
- Virtual (video call) and in-person consultations are available.
- Services include deed verification, power of attorney drafting, tripartite agreement review, and partition settlement.
Click the **"Book Lawyer"** button below to browse lawyer profiles and pick a date/time slot!`,
  },
  {
    triggers: ['advance', 'deposit', 'agreement', 'escrow', 'payment'],
    title: 'Advance Payments & Agreement to Sell',
    response: `**Safe Advance Payment Rules:**
- Never pay an advance in cash without an attested **Agreement to Sell (Sale & Purchase Agreement)** signed before a licensed Notary Public.
- Standard advance is typically **10% to 20%** of agreed price.
- The agreement must specify:
  1. Title clearance timeline (usually 4 to 8 weeks)
  2. Forfeiture vs refund conditions if title defects are discovered
  3. Handover date with vacant possession.`,
  },
]

export default function KnwLegalBot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Ayubowan! 🙏 I am your **KNW Legal & Real Estate AI Assistant**. Ask me anything about Sri Lankan property laws, title deeds, foreign buyer rules, stamp duty, or lawyer bookings.',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const quickChips = [
    'Can foreigners buy land?',
    'What is Bim Saviya deed?',
    'Calculate stamp duty rates',
    '30-year title deed check',
    'Safe advance payment rules',
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const findAnswer = (query) => {
    const q = query.toLowerCase()
    for (const item of KNOWLEDGE_BASE) {
      if (item.triggers.some(t => q.includes(t))) {
        return item.response
      }
    }
    return `That's a specific property inquiry. Sri Lankan land transactions involve municipal zoning, local council approvals, and Title Registration regulations.
    
For your safety, we recommend reviewing this with one of our certified Sri Lankan property lawyers who can verify the relevant Land Registry folios and survey plans. Click **"Book a Lawyer"** below to schedule an appointment.`
  }

  const handleSend = (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg = { id: Date.now(), sender: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = findAnswer(query)
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: botResponse },
      ])
      setIsTyping(false)
    }, 600)
  }

  return (
    <aside className="legalbot-container" aria-label="AI Legal Assistant">
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          className="legalbot-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open Legal AI Assistant"
        >
          <span className="legalbot-trigger-badge">AI</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="legalbot-trigger-text">Legal AI Help</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <section className="legalbot-window" aria-label="Legal AI Assistant Chat">
          {/* Header */}
          <div className="legalbot-header">
            <div className="legalbot-avatar-wrap">
              <div className="legalbot-avatar">⚖️</div>
              <div className="legalbot-title-info">
                <h4>KNW LegalBot AI</h4>
                <span>Online · Sri Lanka Property Law</span>
              </div>
            </div>
            <button className="legalbot-minimize-btn" onClick={() => setIsOpen(false)} aria-label="Close">
              &minus;
            </button>
          </div>

          {/* Quick chips */}
          <div className="legalbot-chips-bar">
            {quickChips.map((chip, i) => (
              <button key={i} className="legalbot-chip" onClick={() => handleSend(chip)}>
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="legalbot-messages">
            {messages.map(m => (
              <div key={m.id} className={`legalbot-msg legalbot-msg--${m.sender}`}>
                {m.sender === 'bot' && <div className="legalbot-msg-icon">🤖</div>}
                <div className="legalbot-msg-bubble">
                  {m.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {m.sender === 'bot' && (
                    <div className="legalbot-bot-cta">
                      <button
                        className="legalbot-action-btn"
                        onClick={() => {
                          setIsOpen(false)
                          onNavigate('legal')
                        }}
                      >
                        ⚖️ Book Verified Property Lawyer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="legalbot-typing">
                <span>KNW LegalBot is analyzing property laws...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            className="legalbot-input-form"
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
          >
            <input
              type="text"
              className="legalbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a legal or property question..."
            />
            <button type="submit" className="legalbot-send-btn" disabled={!input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </aside>
  )
}
