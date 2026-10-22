// frontend/src/utils/calendarInvite.js
// Utility to generate and download standard iCalendar (.ics) files

export function downloadCalendarInvite({
  title,
  description,
  location,
  startDate, // Date object or 'YYYY-MM-DD'
  timeSlot,  // e.g. '09:00 - 12:00' or 'morning'
  contactName,
  contactPhone,
}) {
  const d = new Date(startDate || Date.now())
  
  // Set default hours based on time slot
  let startHour = 10
  let endHour = 12
  const slotStr = String(timeSlot || '').toLowerCase()

  if (slotStr.includes('afternoon') || slotStr.includes('01:00') || slotStr.includes('13:00')) {
    startHour = 14
    endHour = 16
  } else if (slotStr.includes('evening') || slotStr.includes('04:00') || slotStr.includes('16:00')) {
    startHour = 16
    endHour = 18
  } else if (slotStr.includes('morning') || slotStr.includes('09:00')) {
    startHour = 10
    endHour = 12
  }

  const startYear = d.getFullYear()
  const startMonth = String(d.getMonth() + 1).padStart(2, '0')
  const startDay = String(d.getDate()).padStart(2, '0')

  const dtStart = `${startYear}${startMonth}${startDay}T${String(startHour).padStart(2, '0')}0000`
  const dtEnd = `${startYear}${startMonth}${startDay}T${String(endHour).padStart(2, '0')}0000`
  const uid = `KNW-INSPECT-${Date.now()}@knwprorealtor.lk`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KNW PRO Realtor//Property Site Inspection//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title || 'KNW Property Site Inspection'}`,
    `DESCRIPTION:${(description || 'Physical on-site inspection organized via KNW PRO Realtor.').replace(/\n/g, '\\n')}\\nContact: ${contactName || 'Seller'} (${contactPhone || 'N/A'})`,
    `LOCATION:${location || 'Sri Lanka'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Upcoming Property Site Inspection',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `KNW_Site_Inspection_${startYear}${startMonth}${startDay}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
