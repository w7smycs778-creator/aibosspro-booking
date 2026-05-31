import { useState, useMemo } from 'react'

const HEBREW_MONTHS = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
]

// Week starts Sunday in Israel. ש׳ = Saturday (index 6) is blocked.
const DAY_HEADERS = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳']

function ymd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function DatePicker({ value, onChange }) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const maxDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 60)
    return d
  }, [today])

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const cells = useMemo(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay() // 0=Sun
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate()
    return [
      ...Array.from({ length: firstDow }, () => null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ]
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function isDisabled(day) {
    const d = new Date(viewYear, viewMonth, day)
    return d < today || d > maxDate || d.getDay() === 6 // 6 = Saturday
  }

  function handleSelect(day) {
    if (!day || isDisabled(day)) return
    onChange(ymd(new Date(viewYear, viewMonth, day)))
  }

  const todayStr = ymd(today)
  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth === today.getMonth())
  const canGoNext =
    new Date(viewYear, viewMonth, 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 select-none">
      {/* Month navigation — RTL: first child is on the RIGHT */}
      <div className="flex items-center justify-between mb-4">
        {/* RIGHT side → previous month */}
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B949E]
            hover:text-white hover:bg-[#21262D] disabled:opacity-25 disabled:cursor-not-allowed
            transition-colors"
          aria-label="חודש קודם"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <span className="text-white text-sm font-semibold">
          {HEBREW_MONTHS[viewMonth]} {viewYear}
        </span>

        {/* LEFT side → next month */}
        <button
          type="button"
          onClick={nextMonth}
          disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B949E]
            hover:text-white hover:bg-[#21262D] disabled:opacity-25 disabled:cursor-not-allowed
            transition-colors"
          aria-label="חודש הבא"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            className={`text-center text-xs py-1 ${d === 'ש׳' ? 'text-red-400/40' : 'text-[#8B949E]'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />

          const d = new Date(viewYear, viewMonth, day)
          const dateStr = ymd(d)
          const isSat = d.getDay() === 6
          const disabled = isDisabled(day)
          const selected = value === dateStr
          const isToday = todayStr === dateStr

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleSelect(day)}
              disabled={disabled}
              className={[
                'w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-all duration-100',
                selected
                  ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-900/40'
                  : disabled
                    ? isSat
                      ? 'text-red-400/25 cursor-not-allowed'
                      : 'text-[#30363D] cursor-not-allowed'
                    : isToday
                      ? 'text-[#2563EB] font-semibold hover:bg-[#2563EB]/10 cursor-pointer'
                      : 'text-white hover:bg-[#21262D] cursor-pointer',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
