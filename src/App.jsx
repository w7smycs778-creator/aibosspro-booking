import { useState } from 'react'
import BookingForm from './components/BookingForm.jsx'
import SuccessScreen from './components/SuccessScreen.jsx'

export default function App() {
  const [booking, setBooking] = useState(null)

  return (
    <div className="relative z-[1] min-h-screen bg-[#0D1117] flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-sm px-6 pt-10 pb-5">
        <div className="text-center">
          <p className="logo-glow text-3xl font-extrabold tracking-widest text-[#2563EB] mb-1 select-none">
            AIBOSSPRO
          </p>
          <p className="text-[#2563EB]/50 text-xs tracking-[0.2em] font-mono uppercase mb-2">
            We Automate. You Scale.
          </p>
          <p className="text-[#8B949E] text-sm tracking-wide">שירותי AI ואוטומציה</p>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#2563EB]/30 to-transparent" />
        </div>
      </header>

      {/* Page body */}
      <main className="w-full max-w-sm pb-16 animate-fade-in">
        {booking ? (
          <div className="px-5">
            <SuccessScreen booking={booking} />
          </div>
        ) : (
          <div
            className="mx-5 rounded-2xl px-5 py-6"
            style={{
              border: '1px solid rgba(37, 99, 235, 0.3)',
              boxShadow: '0 0 30px rgba(37, 99, 235, 0.1)',
            }}
          >
            <div className="mb-7 text-center">
              <h1 className="text-xl font-bold text-white">קבע שיחת ייעוץ חינם</h1>
              <p className="text-[#8B949E] text-sm mt-1">בחר שירות ותאריך מועדף</p>
            </div>
            <BookingForm onSuccess={setBooking} />
          </div>
        )}
      </main>
    </div>
  )
}
