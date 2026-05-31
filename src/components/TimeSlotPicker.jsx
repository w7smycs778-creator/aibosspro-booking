export default function TimeSlotPicker({ slots, selected, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 rounded-xl bg-[#161B22] animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-[#8B949E] text-sm py-4">
        אין זמינות לתאריך זה
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2 animate-slide-up">
      {slots.map(slot => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={[
            'h-11 rounded-xl text-sm font-medium transition-all duration-150',
            selected === slot
              ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/40'
              : 'bg-[#161B22] text-[#8B949E] border border-[#30363D] hover:border-[#2563EB] hover:text-white',
          ].join(' ')}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}
