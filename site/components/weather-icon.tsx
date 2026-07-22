import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  Snowflake,
  CloudLightning,
  type LucideProps,
} from 'lucide-react'
import type { IconKey } from '@/lib/weather'

const dayMap: Record<IconKey, React.ComponentType<LucideProps>> = {
  clear: Sun,
  'mostly-clear': CloudSun,
  cloudy: CloudSun,
  overcast: Cloudy,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: Snowflake,
  showers: CloudRainWind,
  thunder: CloudLightning,
}

const nightMap: Record<IconKey, React.ComponentType<LucideProps>> = {
  clear: Moon,
  'mostly-clear': CloudMoon,
  cloudy: CloudMoon,
  overcast: Cloudy,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: Snowflake,
  showers: CloudRainWind,
  thunder: CloudLightning,
}

export function WeatherIcon({
  icon,
  night = false,
  ...props
}: { icon: IconKey; night?: boolean } & LucideProps) {
  const Comp = (night ? nightMap : dayMap)[icon] ?? Cloud
  return <Comp {...props} />
}
