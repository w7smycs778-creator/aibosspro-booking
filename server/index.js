import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'
import axios from 'axios'
import { randomUUID } from 'crypto'

const app = express()
app.use(express.json())
app.use(cors())

const ALL_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

// Israel is UTC+2 (winter) or UTC+3 (summer / DST).
// Rough approximation: April–October → +03:00, otherwise +02:00.
function israelTzOffset(dateStr) {
  const month = parseInt(dateStr.split('-')[1], 10)
  return month >= 4 && month <= 10 ? '+03:00' : '+02:00'
}

function getCalendar() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set in .env')

  let credentials
  try {
    credentials = JSON.parse(raw)
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON')
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return google.calendar({ version: 'v3', auth })
}

// ── GET /api/availability?date=YYYY-MM-DD ──────────────────────────────
app.get('/api/availability', async (req, res) => {
  const { date } = req.query
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Valid date required (YYYY-MM-DD)' })
  }

  try {
    const tz = israelTzOffset(date)
    const timeMin = new Date(`${date}T00:00:00${tz}`).toISOString()
    const timeMax = new Date(`${date}T23:59:59${tz}`).toISOString()

    const calendar = getCalendar()
    const { data } = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const booked = new Set(
      (data.items || [])
        .filter(e => e.start?.dateTime)
        .map(e => {
          // Parse hour:minute in Israel local time
          const dt = new Date(e.start.dateTime)
          const local = dt.toLocaleTimeString('he-IL', {
            timeZone: 'Asia/Jerusalem',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          return local.slice(0, 5) // "HH:MM"
        })
    )

    res.json({ available: ALL_SLOTS.filter(s => !booked.has(s)) })
  } catch (err) {
    console.error('[availability]', err.message)
    res.status(500).json({ error: 'שגיאה בטעינת זמינות. נסה שוב.' })
  }
})

// ── POST /api/book ─────────────────────────────────────────────────────
app.post('/api/book', async (req, res) => {
  const { clientName, clientPhone, treatment, date, time } = req.body

  if (!clientName || !clientPhone || !treatment || !date || !time) {
    return res.status(400).json({ error: 'כל השדות נדרשים' })
  }

  const cleanPhone = clientPhone.replace(/[-\s]/g, '')
  if (!/^05\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'מספר טלפון לא תקין — חייב להתחיל ב-05 ולהכיל 10 ספרות' })
  }

  if (!ALL_SLOTS.includes(time)) {
    return res.status(400).json({ error: 'שעה לא חוקית' })
  }

  try {
    const tz = israelTzOffset(date)
    const startDateTime = new Date(`${date}T${time}:00${tz}`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)

    const calendar = getCalendar()

    // Guard: verify slot is still available before inserting
    const timeMin = new Date(`${date}T00:00:00${tz}`).toISOString()
    const timeMax = new Date(`${date}T23:59:59${tz}`).toISOString()
    const { data: existing } = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
    })

    const taken = (existing.items || [])
      .filter(e => e.start?.dateTime)
      .some(e => {
        const dt = new Date(e.start.dateTime)
        const local = dt.toLocaleTimeString('he-IL', {
          timeZone: 'Asia/Jerusalem',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        return local.slice(0, 5) === time
      })

    if (taken) {
      return res.status(409).json({ error: 'שעה זו כבר תפוסה — אנא בחר שעה אחרת' })
    }

    const bookingId = randomUUID()

    const { data: calEvent } = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      requestBody: {
        summary: `${treatment} — ${clientName}`,
        description: `שם: ${clientName}\nטלפון: ${cleanPhone}\nטיפול: ${treatment}\nBooking ID: ${bookingId}`,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Jerusalem' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Jerusalem' },
      },
    })

    // Fire WhatsApp webhook (non-blocking — failure doesn't cancel the booking)
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL
    if (webhookUrl) {
      axios
        .post(webhookUrl, {
          clientName,
          clientPhone: cleanPhone,
          treatment,
          date,
          time,
          bookingId,
          calendarLink: calEvent.htmlLink ?? null,
        }, { timeout: 8000 })
        .catch(e => console.warn('[webhook]', e.message))
    }

    res.json({ success: true })
  } catch (err) {
    console.error('[book]', err.message)
    res.status(500).json({ error: 'שגיאה בקביעת התור. נסה שוב.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n  API server  →  http://localhost:${PORT}\n`)
})
