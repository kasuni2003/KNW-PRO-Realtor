import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { SystemSettingsProvider } from './context/SystemSettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SystemSettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </AuthProvider>
      </LanguageProvider>
    </SystemSettingsProvider>
  </StrictMode>,
)
