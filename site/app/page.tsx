'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, Star, RefreshCw, Loader2, CloudSun } from 'lucide-react'
import { TopBar } from '@/components/top-bar'
import { AlertsBar } from '@/components/alerts'
import { CurrentView } from '@/components/current-view'
import { HourlyView } from '@/components/hourly-view'
import { ForecastView } from '@/components/forecast-view'
import { RadarView } from '@/components/radar-view'
import { SunMoonWidget } from '@/components/sun-moon-widget'
import { SavedLocationsWidget } from '@/components/saved-locations-widget'
import { HurricaneWidget } from '@/components/hurricane-widget'
import { SettingsDialog } from '@/components/settings-dialog'
import {
  fetchWeather,
  fetchAirQuality,
  fetchAlerts,
  fetchActiveStorms,
  reverseGeocode,
  getWeatherInfo,
  getSkyClass,
  geoLabel,
  type Settings,
  type Coords,
  type WeatherResponse,
  type WeatherAlert,
  type Favorite,
  type GeoResult,
  type NHCStorm,
} from '@/lib/weather'

const DEFAULT_SETTINGS: Settings = { tempUnit: 'celsius', windUnit: 'kmh', theme: 'dark' }
const DEFAULT_COORDS: Coords = { lat: 42.9834, lon: -81.233 }
const DEFAULT_NAME = 'London, ON'

export default function Page() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS)
  const [locationName, setLocationName] = useState('Locating…')
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [aqi, setAqi] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [activeStorms, setActiveStorms] = useState<NHCStorm[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [forecastTab, setForecastTab] = useState<'hourly' | 'daily'>('hourly')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const bootedRef = useRef(false)

  // ── Load persisted state + apply theme ────────────────────────────
  useEffect(() => {
    try {
      const s = localStorage.getItem('skywatch_settings')
      if (s) setSettings((prev) => ({ ...prev, ...JSON.parse(s) }))
      const f = localStorage.getItem('skywatch_favorites')
      if (f) setFavorites(JSON.parse(f))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
    document.documentElement.classList.toggle('light', settings.theme === 'light')
  }, [settings.theme])

  // ── Core loader ───────────────────────────────────────────────────
  const load = useCallback(async (c: Coords, name?: string, reverse = false) => {
    setLoading(true)
    setError(false)
    if (name) setLocationName(name)
    else if (reverse) setLocationName('Locating…')
    try {
      const [weather, aqiRes, storms] = await Promise.all([
        fetchWeather(c.lat, c.lon, settingsRef.current),
        fetchAirQuality(c.lat, c.lon),
        fetchActiveStorms(),
      ])
      setData(weather)
      setAqi(aqiRes?.current?.us_aqi ?? null)
      setActiveStorms(storms)
      if (reverse && !name) {
        const resolved = await reverseGeocode(c.lat, c.lon)
        setLocationName(resolved)
      }
      fetchAlerts(c.lat, c.lon).then(setAlerts)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // ── Initial geolocation ───────────────────────────────────────────
  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true

    const fallback = () => {
      setCoords(DEFAULT_COORDS)
      load(DEFAULT_COORDS, DEFAULT_NAME)
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lon: pos.coords.longitude }
          setCoords(c)
          load(c, undefined, true)
        },
        fallback,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    } else {
      fallback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Re-fetch when units change (not theme) ────────────────────────
  const unitKey = `${settings.tempUnit}-${settings.windUnit}`
  const firstUnit = useRef(true)
  useEffect(() => {
    if (firstUnit.current) {
      firstUnit.current = false
      return
    }
    load(coords, locationName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitKey])

  // ── Persist favorites; keep current temp cached ───────────────────
  useEffect(() => {
    if (!data) return
    const info = getWeatherInfo(data.current.weather_code)
    setFavorites((prev) => {
      const idx = prev.findIndex((f) => f.name.toLowerCase() === locationName.toLowerCase())
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        temp: Math.round(data.current.temperature_2m),
        desc: info.text,
        code: data.current.weather_code,
      }
      localStorage.setItem('skywatch_favorites', JSON.stringify(next))
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, locationName])

  // ── Handlers ──────────────────────────────────────────────────────
  function updateSettings(patch: Partial<Settings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem('skywatch_settings', JSON.stringify(next))
      return next
    })
  }

  function selectGeo(r: GeoResult) {
    const c = { lat: r.latitude, lon: r.longitude }
    setCoords(c)
    load(c, geoLabel(r))
    setView('current')
  }

  function selectFavorite(f: Favorite) {
    const c = { lat: f.lat, lon: f.lon }
    setCoords(c)
    load(c, f.name)
    setView('current')
  }

  function removeFavorite(name: string) {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.name.toLowerCase() !== name.toLowerCase())
      localStorage.setItem('skywatch_favorites', JSON.stringify(next))
      return next
    })
  }

  const isFav = favorites.some((f) => f.name.toLowerCase() === locationName.toLowerCase())

  function toggleFavorite() {
    if (!data || locationName === 'Locating…') return
    if (isFav) {
      removeFavorite(locationName)
      return
    }
    const info = getWeatherInfo(data.current.weather_code)
    setFavorites((prev) => {
      const next = [
        ...prev,
        {
          name: locationName,
          lat: coords.lat,
          lon: coords.lon,
          temp: Math.round(data.current.temperature_2m),
          desc: info.text,
          code: data.current.weather_code,
        },
      ]
      localStorage.setItem('skywatch_favorites', JSON.stringify(next))
      return next
    })
  }

  function refresh() {
    setRefreshing(true)
    load(coords, locationName)
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar
        onSelect={selectGeo}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={settings.theme}
        onToggleTheme={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 shrink-0 text-primary" />
            <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
              {locationName}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={toggleFavorite}
              title={isFav ? 'Remove from saved' : 'Save location'}
              aria-label={isFav ? 'Remove from saved' : 'Save location'}
              className={`flex size-9 items-center justify-center rounded-xl transition hover:bg-secondary ${
                isFav ? 'text-warning' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className={`size-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={refresh}
              title="Refresh"
              aria-label="Refresh weather"
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw className={`size-5 ${refreshing ? 'animate-spin-once' : ''}`} />
            </button>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-4">
            <AlertsBar alerts={alerts} />
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
          {error ? (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <CloudSun className="size-10 text-muted-foreground" />
              <p className="font-semibold">Couldn&apos;t load weather data</p>
              <button
                onClick={refresh}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
              >
                Try again
              </button>
            </div>
          ) : loading || !data ? (
            <div className="col-span-full flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card shadow-sm text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="text-sm">Loading forecast…</span>
            </div>
          ) : (
            <>
              {/* Main Column */}
              <div className="flex flex-col gap-6 min-w-0">
                <CurrentView data={data} settings={settings} aqi={aqi} />

                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-border">
                    <button
                      onClick={() => setForecastTab('hourly')}
                      className={`pb-2 px-1 text-sm font-semibold transition-colors ${
                        forecastTab === 'hourly'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Short Term (Hourly)
                    </button>
                    <button
                      onClick={() => setForecastTab('daily')}
                      className={`pb-2 px-1 text-sm font-semibold transition-colors ${
                        forecastTab === 'daily'
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Long Term (7-Day)
                    </button>
                  </div>
                  {forecastTab === 'hourly' ? (
                    <HourlyView data={data} settings={settings} />
                  ) : (
                    <ForecastView data={data} />
                  )}
                </section>

                <RadarView coords={coords} />
              </div>

              {/* Right Rail */}
              <aside className="flex flex-col gap-6">
                {activeStorms.length > 0 && <HurricaneWidget storms={activeStorms} settings={settings} />}
                <SavedLocationsWidget
                  favorites={favorites}
                  onSelectFavorite={selectFavorite}
                  onRemoveFavorite={removeFavorite}
                />
                <SunMoonWidget data={data} />
              </aside>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CloudSun className="size-4" />
            </span>
            <span className="font-display font-bold">SkyWatch</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkyWatch — Live weather, radar &amp; forecasts
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {['Open-Meteo', 'NWS', 'Environment Canada', 'RainViewer'].map((s) => (
              <span key={s} className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </footer>

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
