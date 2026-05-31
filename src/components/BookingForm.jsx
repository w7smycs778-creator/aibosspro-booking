import { useState, useEffect } from 'react'
import DatePicker from './DatePicker.jsx'
import TimeSlotPicker from './TimeSlotPicker.jsx'

const TREATMENTS = [
  { value: 'whatsapp-ai',  label: 'מערכת WhatsApp AI' },
  { value: 'website-ai',   label: 'אתר אינטרנט עם AI' },
  { value: 'automation',   label: 'אוטומציה עסקית' },
  { value: 'full-package', label: 'חבילה מלאה' },
]

function Label({ children }) {
  return (
    <label className="block text-[#8B949E] text-sm mb-2 text-right">
      {children}
    </label>
  )
}

const inputCls = [
  'w-full bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3',
  'text-white text-right placeholder-[#8B949E]',
  'focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none',
  'transition-colors duration-150',
].join(' ')

export default function BookingForm({ onSuccess }) {
  const [treatment, setTreatment]       = useState('')
  const [date, setDate]                 = useState('')
  const [time, setTime]                 = useState('')
  const [name, setName]                 = useState('')
  const [phone, setPhone]               = useState('')
  const [availableSlots, setAvailable]  = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitted, setSubmitted]       = useState(false) // prevent double-submit

  // Fetch available slots whenever the date changes
  useEffect(() => {
    if (!date) return
    setTime('')
    setAvailable([])
    setSlotsLoading(true)
    fetch(`/api/availability?date=${date}`)
      .then(r => r.json())
      .then(d => setAvailable(d.available ?? []))
      .catch(() => setAvailable([]))
      .finally(() => setSlotsLoading(false))
  }, [date])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitted) return
    setError('')

    const cleanPhone = phone.replace(/[-\s]/g, '')

    if (!treatment || !date || !time || !name.trim() || !cleanPhone) {
      setError('יש למלא את כל השדות')
      return
    }
    if (!/^05\d{8}$/.test(cleanPhone)) {
      setError('מספר טלפון לא תקין — חייב להתחיל ב-05 ולהכיל 10 ספרות')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: name.trim(),
          clientPhone: cleanPhone,
          treatment,
          date,
          time,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'שגיאה בקביעת התור')

      setSubmitted(true)
      onSuccess({ clientName: name.trim(), clientPhone: cleanPhone, treatment, date, time })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Treatment */}
      <div>
        <Label>סוג שירות</Label>
        <div className="relative">
          <select
            value={treatment}
            onChange={e => setTreatment(e.target.value)}
            disabled={submitted}
            className={`${inputCls} appearance-none cursor-pointer`}
          >
            <option value="" disabled>בחר שירות...</option>
            {TREATMENTS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {/* Dropdown chevron — left side in RTL */}
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Date picker */}
      <div>
        <Label>תאריך</Label>
        <DatePicker value={date} onChange={submitted ? () => {} : setDate} />
        {date && (
          <p className="text-xs text-[#8B949E] mt-2 text-right">
            {date.split('-').reverse().join('/')}
          </p>
        )}
      </div>

      {/* Time slots — shown only after a date is chosen */}
      {date && (
        <div className="animate-slide-up">
          <Label>שעה</Label>
          <TimeSlotPicker
            slots={availableSlots}
            selected={time}
            onSelect={submitted ? () => {} : setTime}
            loading={slotsLoading}
          />
        </div>
      )}

      {/* Full name */}
      <div>
        <Label>שם מלא</Label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ישראל ישראלי"
          autoComplete="name"
          disabled={submitted}
          className={inputCls}
        />
      </div>

      {/* Phone — LTR direction for the number itself */}
      <div>
        <Label>מספר טלפון</Label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="050-0000000"
          autoComplete="tel"
          inputMode="tel"
          dir="ltr"
          disabled={submitted}
          className={`${inputCls} text-left`}
        />
      </div>

      {/* Validation / API error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-right animate-slide-up">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || submitted}
        className={[
          'w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 mt-2',
          submitting || submitted
            ? 'bg-[#2563EB]/50 cursor-not-allowed'
            : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] shadow-lg shadow-blue-900/30',
        ].join(' ')}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            שולח...
          </span>
        ) : (
          'אישור הזמנה'
        )}
      </button>
    </form>
  )
}
