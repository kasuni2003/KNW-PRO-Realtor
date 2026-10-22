import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext(null)

export const CURRENCY_RATES = {
  LKR: { code: 'LKR', symbol: 'Rs.', label: 'Sri Lankan Rupee', rate: 1, flag: '🇱🇰' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 / 305, flag: '🇺🇸' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', rate: 1 / 395, flag: '🇬🇧' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1 / 202, flag: '🇦🇺' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', rate: 1 / 332, flag: '🇪🇺' },
  AED: { code: 'AED', symbol: 'AED', label: 'UAE Dirham', rate: 1 / 83, flag: '🇦🇪' },
  CAD: { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', rate: 1 / 225, flag: '🇨🇦' },
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return window.localStorage.getItem('knw_currency') || 'LKR'
  })

  useEffect(() => {
    window.localStorage.setItem('knw_currency', currency)
  }, [currency])

  const convertPrice = (lkrAmount) => {
    if (!lkrAmount) return 0
    // Parse any numeric value from string (e.g. "Rs. 25,000,000" or "25M" or raw number)
    const num = typeof lkrAmount === 'number' 
      ? lkrAmount 
      : parseFloat(String(lkrAmount).replace(/[^0-9.]/g, '')) || 0
    const config = CURRENCY_RATES[currency] || CURRENCY_RATES.LKR
    return num * config.rate
  }

  const formatPrice = (lkrAmount) => {
    if (!lkrAmount && lkrAmount !== 0) return 'Price on Request'
    const config = CURRENCY_RATES[currency] || CURRENCY_RATES.LKR
    
    // Extract raw number
    let rawStr = String(lkrAmount).trim()
    let num = 0
    if (/(\d+(?:\.\d+)?)\s*(?:million|m\b)/i.test(rawStr)) {
      const match = rawStr.match(/(\d+(?:\.\d+)?)\s*(?:million|m\b)/i)
      num = parseFloat(match[1]) * 1000000
    } else if (/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs)/i.test(rawStr)) {
      const match = rawStr.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs)/i)
      num = parseFloat(match[1]) * 100000
    } else {
      num = parseFloat(rawStr.replace(/[^0-9.]/g, '')) || 0
    }

    if (num <= 0) return rawStr || 'Price on Request'

    const converted = num * config.rate
    if (currency === 'LKR') {
      if (converted >= 10000000) {
        return `Rs. ${(converted / 10000000).toFixed(2)} Cr`
      }
      if (converted >= 1000000) {
        return `Rs. ${(converted / 1000000).toFixed(2)} Million`
      }
      return `Rs. ${Math.round(converted).toLocaleString()}`
    }

    // Foreign currency formatting
    if (converted >= 1000000) {
      return `${config.symbol}${(converted / 1000000).toFixed(2)}M ${config.code}`
    }
    return `${config.symbol}${Math.round(converted).toLocaleString()} ${config.code}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCY_RATES, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    return {
      currency: 'LKR',
      setCurrency: () => {},
      currencies: CURRENCY_RATES,
      convertPrice: (p) => p,
      formatPrice: (p) => String(p || ''),
    }
  }
  return context
}
