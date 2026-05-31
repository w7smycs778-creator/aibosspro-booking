const TREATMENT_LABELS = {
  'whatsapp-ai':  'מערכת WhatsApp AI',
  'website-ai':   'אתר אינטרנט עם AI',
  'automation':   'אוטומציה עסקית',
  'full-package': 'חבילה מלאה',
}

const HEBREW_MONTHS = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
]

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ב${HEBREW_MONTHS[m - 1]} ${y}`
}

function Row({ label, value }) {
  return (
    <>
      <div className="flex justify-between items-center py-3">
        <span className="text-[#8B949E] text-sm">{label}</span>
        <span className="text-white font-medium text-sm">{value}</span>
      </div>
      <div className="h-px bg-[#21262D] last:hidden" />
    </>
  )
}

export default function SuccessScreen({ booking }) {
  return (
    <div className="text-center space-y-7 animate-fade-in">
      {/* Checkmark */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
          <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">השיחה שלך נקבעה!</h2>
        <p className="text-[#8B949E] text-sm leading-relaxed">
          נשלח לך אישור בוואטסאפ תוך דקה.
        </p>
      </div>

      {/* Booking summary card */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl px-5 text-right">
        <Row label="שירות" value={TREATMENT_LABELS[booking.treatment] ?? booking.treatment} />
        <Row label="תאריך" value={formatDate(booking.date)} />
        <Row label="שעה" value={booking.time} />
        <Row label="שם" value={booking.clientName} />
        <Row label="טלפון" value={booking.clientPhone} />
      </div>

      <p className="text-[#8B949E] text-xs">
        לביטול או שינוי תור, שלח הודעה בוואטסאפ
      </p>
    </div>
  )
}
