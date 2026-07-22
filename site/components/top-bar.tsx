'use client'

import { CloudSun, Settings, Moon, Sun } from 'lucide-react'
import { SearchBox } from '@/components/search-box'
import type { GeoResult, Theme } from '@/lib/weather'

export function TopBar({
  onSelect,
  onOpenSettings,
  theme,
  onToggleTheme,
}: {
  onSelect: (r: GeoResult) => void
  onOpenSettings: () => void
  theme: Theme
  onToggleTheme: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <CloudSun className="size-6" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-xl font-light tracking-tight uppercase">SkyWatch</span>
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Global Data</span>
          </span>
        </a>

        <div className="flex flex-1 justify-center">
          <SearchBox onSelect={onSelect} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            aria-label="Toggle color theme"
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Open settings"
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
