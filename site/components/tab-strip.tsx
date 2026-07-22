'use client'

import { CloudSun, Clock, CalendarDays, Radio, type LucideProps } from 'lucide-react'

export type ViewName = 'current' | 'hourly' | 'forecast' | 'radar'

const tabs: { id: ViewName; label: string; icon: React.ComponentType<LucideProps> }[] = [
  { id: 'current', label: 'Current', icon: CloudSun },
  { id: 'hourly', label: 'Hourly', icon: Clock },
  { id: 'forecast', label: '7 Days', icon: CalendarDays },
  { id: 'radar', label: 'Radar', icon: Radio },
]

export function TabStrip({
  active,
  onChange,
}: {
  active: ViewName
  onChange: (v: ViewName) => void
}) {
  return (
    <nav className="mx-auto max-w-6xl px-4">
      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
