import axios from 'axios'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = window.localStorage.getItem('KNW PRO REALTOR User')
    return saved ? JSON.parse(saved) : null
  })
  const [activeRole, setActiveRoleState] = useState(() => {
    const savedMode = window.localStorage.getItem('KNW_ACTIVE_MODE')
    if (savedMode) return savedMode
    const saved = window.localStorage.getItem('KNW PRO REALTOR User')
    if (saved) {
      try {
        const u = JSON.parse(saved)
        if (['admin', 'staff'].includes(u?.role)) return 'admin'
        if (u?.role === 'lawyer') return 'lawyer'
        if (u?.role === 'seller') return 'seller'
        return 'buyer'
      } catch {}
    }
    return 'buyer'
  })
  const [authError, setAuthError] = useState('')

  const switchRole = (newRole) => {
    setActiveRoleState(newRole)
    window.localStorage.setItem('KNW_ACTIVE_MODE', newRole)
  }

  const login = async ({ email, password }) => {
    setAuthError('')
    if (!email || !password) {
      setAuthError('Please enter your email and password.')
      return false
    }

    try {
      const res = await axios.post('/api/auth/login', { email, password })
      const loggedUser = res.data.user
      setUser(loggedUser)
      window.localStorage.setItem('KNW PRO REALTOR User', JSON.stringify(loggedUser))
      const defaultMode = ['admin', 'staff'].includes(loggedUser.role)
        ? 'admin'
        : loggedUser.role === 'lawyer'
        ? 'lawyer'
        : loggedUser.role === 'seller'
        ? 'seller'
        : 'buyer'
      setActiveRoleState(defaultMode)
      window.localStorage.setItem('KNW_ACTIVE_MODE', defaultMode)
      return loggedUser
    } catch (error) {
      setAuthError(getApiError(error, 'Login failed. Please check your details.'))
      return false
    }
  }

  const register = async (userData) => {
    setAuthError('')
    const { name, email, password, role } = userData
    if (!name || !email || !password) {
      setAuthError('Please fill in all required fields.')
      return false
    }

    try {
      let payload
      let config = {}

      if (userData.nic_document instanceof File) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('password', password)
        formData.append('password_confirmation', userData.confirm || password)
        formData.append('role', role)
        if (userData.phone) formData.append('phone', userData.phone)
        if (userData.nic_number) formData.append('nic_number', userData.nic_number)
        if (userData.address) formData.append('address', userData.address)
        formData.append('nic_document', userData.nic_document)
        payload = formData
        config = { headers: { 'Content-Type': 'multipart/form-data' } }
      } else {
        payload = {
          name,
          email,
          password,
          password_confirmation: userData.confirm || password,
          role,
          phone: userData.phone || null,
          nic_number: userData.nic_number || null,
          address: userData.address || null,
        }
      }

      const res = await axios.post('/api/auth/register', payload, config)
      setUser(res.data.user)
      window.localStorage.setItem('KNW PRO REALTOR User', JSON.stringify(res.data.user))
      const defaultMode = ['admin', 'staff'].includes(res.data.user.role)
        ? 'admin'
        : res.data.user.role === 'lawyer'
        ? 'lawyer'
        : res.data.user.role === 'seller'
        ? 'seller'
        : 'buyer'
      setActiveRoleState(defaultMode)
      window.localStorage.setItem('KNW_ACTIVE_MODE', defaultMode)
      return res.data.user
    } catch (error) {
      setAuthError(getApiError(error, 'Registration failed. Please check your details.'))
      return false
    }
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem('KNW PRO REALTOR User')
    window.localStorage.removeItem('KNW_ACTIVE_MODE')
  }

  const applyForSeller = async (formData) => {
    setAuthError('')
    try {
      const payload = new FormData()
      payload.append('user_id', user?.id)
      payload.append('phone', formData.phone || '')
      payload.append('nic_number', formData.nic_number || '')
      payload.append('address', formData.address || '')
      if (formData.nic_document instanceof File) {
        payload.append('nic_document', formData.nic_document)
      }

      const res = await axios.post('/api/user/apply-seller', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data?.user) {
        setUser(res.data.user)
        window.localStorage.setItem('KNW PRO REALTOR User', JSON.stringify(res.data.user))
      }
      return { success: true, message: res.data.message, user: res.data.user }
    } catch (error) {
      const msg = getApiError(error, 'Could not submit seller verification.')
      setAuthError(msg)
      return { success: false, message: msg }
    }
  }

  const refreshUser = (updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser)
      window.localStorage.setItem('KNW PRO REALTOR User', JSON.stringify(updatedUser))
    }
  }

  const changePassword = async ({ current_password, password, password_confirmation }) => {
    setAuthError('')
    try {
      await axios.post('/api/auth/change-password', {
        user_id: user?.id,
        current_password,
        password,
        password_confirmation,
      })
      logout()
      return true
    } catch (error) {
      setAuthError(getApiError(error, 'Could not change password. Please check your current password.'))
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, activeRole, switchRole, applyForSeller, refreshUser, login, register, logout, changePassword, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

function getApiError(error, fallback) {
  const data = error.response?.data
  if (data?.message) return data.message

  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError || fallback
}
