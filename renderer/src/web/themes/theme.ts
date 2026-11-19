export interface ThemeConfig {
  preset: string
  panelBg: string
  surfaceBg: string
  hoverBg: string
  borderColor: string
  accentColor: string
  panelOpacity: number
  hoverOpacity: number
}

export interface ThemePreset {
  id: string
  label: string
  config: Omit<ThemeConfig, 'preset'>
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'carbon-solid',
    label: 'Carbon Solid (100%)',
    config: {
      panelBg: '#12151c',
      surfaceBg: '#0b0d12',
      hoverBg: '#0c0e13',
      borderColor: '#313847',
      accentColor: '#93c5fd',
      panelOpacity: 1,
      hoverOpacity: 1
    }
  },
  {
    id: 'carbon-glass',
    label: 'Carbon Glass',
    config: {
      panelBg: '#101218',
      surfaceBg: '#090b0f',
      hoverBg: '#0a0c10',
      borderColor: '#3a4254',
      accentColor: '#93c5fd',
      panelOpacity: 0.88,
      hoverOpacity: 0.94
    }
  },
  {
    id: 'obsidian-solid',
    label: 'Obsidian (#111211)',
    config: {
      panelBg: '#111211',
      surfaceBg: '#0a0b0a',
      hoverBg: '#0d0e0d',
      borderColor: '#2d312d',
      accentColor: '#d4dad4',
      panelOpacity: 1,
      hoverOpacity: 1
    }
  },
  {
    id: 'poe-gold',
    label: 'PoE Dark Gold',
    config: {
      panelBg: '#110f0c',
      surfaceBg: '#090806',
      hoverBg: '#0a0907',
      borderColor: '#695331',
      accentColor: '#e4c29a',
      panelOpacity: 1,
      hoverOpacity: 1
    }
  },
  {
    id: 'midnight-plum',
    label: 'Midnight Slate',
    config: {
      panelBg: '#14111a',
      surfaceBg: '#0d0b12',
      hoverBg: '#0d0b12',
      borderColor: '#3c334d',
      accentColor: '#c4b5fd',
      panelOpacity: 1,
      hoverOpacity: 1
    }
  }
]

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: THEME_PRESETS[0].id,
  ...THEME_PRESETS[0].config
}

function clampOpacity (val: unknown, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback
  return Math.round(Math.min(1, Math.max(0.5, val)) * 100) / 100
}

function normalizeHex (val: unknown, fallback: string): string {
  if (typeof val !== 'string') return fallback
  const trimmed = val.trim()
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : fallback
}

export function normalizeThemeConfig (raw?: Partial<ThemeConfig> | null): ThemeConfig {
  const base = DEFAULT_THEME_CONFIG
  if (!raw || typeof raw !== 'object') {
    return { ...base }
  }
  return {
    preset: typeof raw.preset === 'string' && raw.preset.length > 0 ? raw.preset : 'custom',
    panelBg: normalizeHex(raw.panelBg, base.panelBg),
    surfaceBg: normalizeHex(raw.surfaceBg, base.surfaceBg),
    hoverBg: normalizeHex(raw.hoverBg, base.hoverBg),
    borderColor: normalizeHex(raw.borderColor, base.borderColor),
    accentColor: normalizeHex(raw.accentColor, base.accentColor),
    panelOpacity: clampOpacity(raw.panelOpacity, base.panelOpacity),
    hoverOpacity: clampOpacity(raw.hoverOpacity, base.hoverOpacity)
  }
}

interface RgbColor {
  r: number
  g: number
  b: number
}

function hexToRgb (hex: string): RgbColor {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  }
}

function rgbaStr (rgb: RgbColor, alpha: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function mixRgb (a: RgbColor, b: RgbColor, weightB: number): RgbColor {
  const w = Math.min(1, Math.max(0, weightB))
  return {
    r: Math.round(a.r * (1 - w) + b.r * w),
    g: Math.round(a.g * (1 - w) + b.g * w),
    b: Math.round(a.b * (1 - w) + b.b * w)
  }
}

function relativeLuminance (rgb: RgbColor): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

export function computeThemeCssVars (theme: ThemeConfig): Record<string, string> {
  const cfg = normalizeThemeConfig(theme)
  const panel = hexToRgb(cfg.panelBg)
  const surface = hexToRgb(cfg.surfaceBg)
  const hover = hexToRgb(cfg.hoverBg)
  const border = hexToRgb(cfg.borderColor)
  const accent = hexToRgb(cfg.accentColor)

  const isLightPanel = relativeLuminance(panel) > 0.42
  const controlTarget: RgbColor = isLightPanel ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
  const control = mixRgb(panel, controlTarget, 0.1)
  const btn = mixRgb(panel, controlTarget, 0.14)
  const header = mixRgb(surface, panel, 0.25)

  return {
    '--apt-panel-bg': rgbaStr(panel, cfg.panelOpacity),
    '--apt-surface-bg': rgbaStr(surface, cfg.panelOpacity),
    '--apt-header-bg': rgbaStr(header, Math.min(1, cfg.panelOpacity + 0.04)),
    '--apt-control-bg': rgbaStr(control, cfg.panelOpacity),
    '--apt-btn-bg': rgbaStr(btn, Math.min(1, cfg.panelOpacity + 0.03)),
    '--apt-btn-hover-bg': rgbaStr(mixRgb(btn, accent, 0.26), Math.min(1, cfg.panelOpacity + 0.06)),
    '--apt-row-odd': isLightPanel ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.035)',
    '--apt-row-hover': rgbaStr(accent, 0.16),
    '--apt-border': rgbaStr(border, 0.9),
    '--apt-border-soft': rgbaStr(border, 0.55),
    '--apt-accent': cfg.accentColor,
    '--apt-focus': rgbaStr(accent, 0.65),
    '--apt-text': isLightPanel ? '#0f172a' : '#f1f5f9',
    '--apt-text-muted': isLightPanel ? '#334155' : '#cbd5e1',
    '--apt-text-subtle': isLightPanel ? '#475569' : '#94a3b8',
    '--apt-blur': cfg.panelOpacity < 0.99 ? 'blur(12px)' : 'none',
    '--apt-hover-bg': rgbaStr(hover, cfg.hoverOpacity),
    '--apt-hover-blur': cfg.hoverOpacity < 0.99 ? 'blur(10px)' : 'none'
  }
}

export function applyThemeConfig (theme: ThemeConfig, target?: HTMLElement): void {
  const el = target ?? document.documentElement
  const vars = computeThemeCssVars(theme)
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value)
  }
}
