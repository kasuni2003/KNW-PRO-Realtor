import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './NotificationBell.css'

export default function NotificationBell({ onNavigate }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    let isMounted = true

    async function fetchNotifications() {
      try {
        const res = await axios.get(`/api/notifications?user_id=${user.id}`)
        if (isMounted) {
          setNotifications(res.data.data || [])
          setUnreadCount(res.data.unread_count || 0)
        }
      } catch (err) {
        // Silently fail polling
      }
    }

    fetchNotifications()

    // Poll every 25 seconds for new notifications
    const interval = setInterval(fetchNotifications, 25000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAsRead = async (id, actionUrl) => {
    try {
      await axios.patch(`/api/notifications/${id}/read?user_id=${user.id}`)
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // Ignore
    }

    setIsOpen(false)

    if (actionUrl) {
      if (actionUrl.startsWith('/property/')) {
        const propId = actionUrl.replace('/property/', '')
        if (onNavigate) {
          onNavigate('propertyDetail', { id: propId })
          return
        }
      } else if ((actionUrl === '/seller' || actionUrl === '/seller-dashboard') && onNavigate) {
        onNavigate('sellerDashboard')
        return
      } else if (actionUrl === '/buyer-dashboard' && onNavigate) {
        onNavigate('buyerDashboard')
        return
      } else if (actionUrl === '/legal' && onNavigate) {
        onNavigate('legal')
        return
      } else if (actionUrl === '/admin' && onNavigate) {
        onNavigate('admin')
        return
      } else if (actionUrl === '/lawyer' && onNavigate) {
        onNavigate('lawyer')
        return
      }

      window.location.href = actionUrl
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`/api/notifications/read-all?user_id=${user.id}`)
      setNotifications(prev => prev.map(item => ({ ...item, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch {
      // Ignore
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/notifications/${id}?user_id=${user.id}`)
      setNotifications(prev => prev.filter(item => item.id !== id))
    } catch {
      // Ignore
    }
  }

  if (!user) return null

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment':
        return '📹'
      case 'inquiry':
        return '📩'
      case 'listing':
        return '🏠'
      case 'account':
        return '🎉'
      default:
        return '🔔'
    }
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = (new Date() - new Date(dateStr)) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notif-badge-count">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <div>
              <h3>Notifications</h3>
              {unreadCount > 0 && <span className="notif-unread-pill">{unreadCount} unread</span>}
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <span className="notif-empty-icon">🔕</span>
                <p>No notifications yet</p>
                <small>Updates regarding inquiries, listings, and consultations will appear here.</small>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map(item => {
                  const isUnread = !item.read_at
                  return (
                    <div
                      key={item.id}
                      className={`notif-item ${isUnread ? 'notif-item--unread' : ''}`}
                      onClick={() => handleMarkAsRead(item.id, item.action_url)}
                    >
                      <div className="notif-item-icon">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="notif-item-content">
                        <div className="notif-item-top">
                          <strong>{item.title}</strong>
                          <span className="notif-time">{formatTimeAgo(item.created_at)}</span>
                        </div>
                        <p>{item.message}</p>
                      </div>
                      <button
                        className="notif-item-delete"
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Delete notification"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="notif-dropdown-footer">
            <span>KNW PRO REALTOR • Live Alerts</span>
          </div>
        </div>
      )}
    </div>
  )
}
