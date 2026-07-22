// ── Types ──────────────────────────────────────────────────────────
export type TempUnit = 'celsius' | 'fahrenheit'
export type WindUnit = 'kmh' | 'mph'
export type Theme = 'dark' | 'light'

export interface Settings {
  tempUnit: TempUnit
  windUnit: WindUnit
  theme: Theme
}

export interface Coords {
  lat: number
  lon: number
}

export interface GeoResult {
  id: number
  name: string
  latitude: number
  longitude: number
  admin1?: string
  country?: string
}

export interface Favorite {
  name: string
  lat: number
  lon: number
  temp: number
  desc: string
  code: number
}

export interface CurrentData {
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  weather_code: number
  wind_speed_10m: number
}

export interface HourlyData {
  time: string[]
  temperature_2m: number[]
  weather_code: number[]
  precipitation_probability: number[]
  wind_speed_10m: number[]
  relative_humidity_2m: number[]
}

export interface DailyData {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  uv_index_max: number[]
  precipitation_sum: number[]
  sunrise: string[]
  sunset: string[]
}

export interface WeatherResponse {
  current: CurrentData
  hourly: HourlyData
  daily: DailyData
}

export interface WeatherAlert {
  title: string
  severity: string
  description: string
  instruction: string
  areaDesc: string
  effective: string
  expires: string
  sender: string
}

// ── Weather code → label + icon key ────────────────────────────────
export type IconKey =
  | 'clear'
  | 'mostly-clear'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'thunder'

interface WeatherInfo {
  text: string
  icon: IconKey
}

export const weatherMap: Record<number, WeatherInfo> = {
  0: { text: 'Clear Sky', icon: 'clear' },
  1: { text: 'Mainly Clear', icon: 'mostly-clear' },
  2: { text: 'Partly Cloudy', icon: 'cloudy' },
  3: { text: 'Overcast', icon: 'overcast' },
  45: { text: 'Fog', icon: 'fog' },
  48: { text: 'Rime Fog', icon: 'fog' },
  51: { text: 'Light Drizzle', icon: 'drizzle' },
  53: { text: 'Drizzle', icon: 'drizzle' },
  55: { text: 'Dense Drizzle', icon: 'drizzle' },
  56: { text: 'Freezing Drizzle', icon: 'drizzle' },
  57: { text: 'Freezing Drizzle', icon: 'drizzle' },
  61: { text: 'Slight Rain', icon: 'rain' },
  63: { text: 'Rain', icon: 'rain' },
  65: { text: 'Heavy Rain', icon: 'rain' },
  66: { text: 'Freezing Rain', icon: 'rain' },
  67: { text: 'Freezing Rain', icon: 'rain' },
  71: { text: 'Slight Snow', icon: 'snow' },
  73: { text: 'Snow', icon: 'snow' },
  75: { text: 'Heavy Snow', icon: 'snow' },
  77: { text: 'Snow Grains', icon: 'snow' },
  80: { text: 'Rain Showers', icon: 'showers' },
  81: { text: 'Rain Showers', icon: 'showers' },
  82: { text: 'Violent Showers', icon: 'showers' },
  85: { text: 'Snow Showers', icon: 'snow' },
  86: { text: 'Snow Showers', icon: 'snow' },
  95: { text: 'Thunderstorm', icon: 'thunder' },
  96: { text: 'Thunderstorm', icon: 'thunder' },
  99: { text: 'Severe Thunderstorm', icon: 'thunder' },
}

export function getWeatherInfo(code: number): WeatherInfo {
  return weatherMap[code] ?? { text: 'Cloudy', icon: 'cloudy' }
}

export function getSkyClass(code: number): string {
  if (code === 0 || code === 1) return 'sky-clear'
  if (code === 2 || code === 3) return 'sky-cloudy'
  if (code === 45 || code === 48) return 'sky-fog'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'sky-rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'sky-snow'
  if ([95, 96, 99].includes(code)) return 'sky-storm'
  return 'sky-clear'
}

// ── Formatting helpers ──────────────────────────────────────────────
export const tempSymbol = (u: TempUnit) => (u === 'fahrenheit' ? '°F' : '°C')
export const windLabel = (u: WindUnit) => (u === 'mph' ? 'mph' : 'km/h')

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

export function formatDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// ── Data fetching ───────────────────────────────────────────────────
export async function fetchWeather(
  lat: number,
  lon: number,
  settings: Settings,
): Promise<WeatherResponse> {
  let url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,relative_humidity_2m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,sunrise,sunset` +
    `&timezone=auto&forecast_days=7`
  if (settings.tempUnit === 'fahrenheit') url += '&temperature_unit=fahrenheit'
  if (settings.windUnit === 'mph') url += '&wind_speed_unit=mph'

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather request failed')
  return res.json()
}

export async function searchGeo(query: string, count = 5): Promise<GeoResult[]> {
  const clean = query.split(',')[0].trim()
  if (!clean) return []
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      clean,
    )}&count=${count}&language=en`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}

export function geoLabel(r: GeoResult) {
  return [r.name, r.admin1 || r.country].filter(Boolean).join(', ')
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    )
    const d = await res.json()
    const city = d.city || d.locality || d.principalSubdivision || 'Unknown'
    let region: string = d.principalSubdivisionCode || d.principalSubdivision || ''
    if (region.includes('-') && region.split('-')[0].length === 2) region = region.split('-')[1]
    return region ? `${city}, ${region}` : city
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}

export async function fetchAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  const all: WeatherAlert[] = []

  // NWS (United States)
  try {
    const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`)
    if (res.ok) {
      const data = await res.json()
      for (const f of data.features ?? []) {
        const p = f.properties
        all.push({
          title: p.event || 'Weather Alert',
          severity: p.severity || 'Moderate',
          description: p.description || '',
          instruction: p.instruction || '',
          areaDesc: p.areaDesc || '',
          effective: p.effective || '',
          expires: p.expires || '',
          sender: p.senderName || 'National Weather Service',
        })
      }
    }
  } catch {
    /* ignore */
  }

  // GeoMet (Environment Canada)
  try {
    const bbox = `${lon - 0.5},${lat - 0.5},${lon + 0.5},${lat + 0.5}`
    const res = await fetch(
      `https://api.weather.gc.ca/collections/weather-alerts/items?f=json&bbox=${bbox}`,
    )
    if (res.ok) {
      const data = await res.json()
      for (const f of data.features ?? []) {
        const p = f.properties
        const name = (p.alert_name_en || 'Weather Alert').replace(/\b\w/g, (l: string) =>
          l.toUpperCase(),
        )
        const code = (p.alert_code || '').toUpperCase()
        let sev = 'Moderate'
        if (code === 'SPS') sev = 'Minor'
        else if (p.alert_type === 'warning') sev = 'Severe'
        all.push({
          title: name,
          severity: sev,
          description: p.alert_text_en || '',
          instruction: '',
          areaDesc: p.feature_name_en || '',
          effective: p.validity_datetime || '',
          expires: p.expiration_datetime || '',
          sender: 'Environment Canada',
        })
      }
    }
  } catch {
    /* ignore */
  }

  // de-dupe by title
  const seen = new Set<string>()
  return all.filter((a) => {
    if (seen.has(a.title)) return false
    seen.add(a.title)
    return true
  })
}
