<template>
  <div class="max-w-lg p-3 space-y-4 font-sans text-sm">
    <div>
      <div class="text-xs uppercase tracking-wider text-gray-500 mb-2">Presets</div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="preset in THEME_PRESETS"
          :key="preset.id"
          type="button"
          class="btn px-2.5 py-1.5 text-xs"
          :class="theme.preset === preset.id ? $style.presetActive : ''"
          @click="applyPreset(preset.id)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="field in colorFields" :key="field.key" class="bg-gray-900 border border-gray-700 rounded p-2">
        <label :for="`theme-color-${field.key}`" class="block text-xs text-gray-400 mb-1.5">{{ field.label }}</label>
        <div class="flex items-center gap-2">
          <input
            :id="`theme-color-${field.key}`"
            type="color"
            :value="theme[field.key]"
            :class="$style.colorSwatch"
            @input="onColorEvent(field.key, $event)"
          >
          <input
            type="text"
            :value="theme[field.key]"
            maxlength="7"
            class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono w-24 text-gray-200"
            @change="onColorEvent(field.key, $event)"
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="bg-gray-900 border border-gray-700 rounded p-2.5 space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <label for="theme-panel-opacity" class="text-gray-400">Opacidade do Aplicativo</label>
          <span class="font-mono text-gray-200">{{ Math.round(theme.panelOpacity * 100) }}%</span>
        </div>
        <input
          id="theme-panel-opacity"
          type="range"
          min="50"
          max="100"
          :value="Math.round(theme.panelOpacity * 100)"
          :class="$style.rangeSlider"
          :style="{ accentColor: theme.accentColor }"
          @input="onOpacityEvent('panelOpacity', $event)"
        >
        <div class="flex justify-end">
          <button type="button" class="btn text-xs px-2 py-0.5" @click="updateOpacity('panelOpacity', 1)">
            100% Sólido
          </button>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-700 rounded p-2.5 space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <label for="theme-hover-opacity" class="text-gray-400">Opacidade do Hover Card</label>
          <span class="font-mono text-gray-200">{{ Math.round(theme.hoverOpacity * 100) }}%</span>
        </div>
        <input
          id="theme-hover-opacity"
          type="range"
          min="50"
          max="100"
          :value="Math.round(theme.hoverOpacity * 100)"
          :class="$style.rangeSlider"
          :style="{ accentColor: theme.accentColor }"
          @input="onOpacityEvent('hoverOpacity', $event)"
        >
        <div class="flex justify-end">
          <button type="button" class="btn text-xs px-2 py-0.5" @click="updateOpacity('hoverOpacity', 1)">
            100% Sólido
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="text-xs uppercase tracking-wider text-gray-500">Prévia ao vivo (aplica ao salvar)</span>
        <button type="button" class="btn text-xs px-2 py-1" @click="resetTheme">Restaurar Padrão</button>
      </div>
      <div
        class="p-3 rounded border border-gray-700 flex flex-wrap gap-3 items-start"
        style="background: repeating-linear-gradient(45deg, #1b1f27 0 10px, #252b36 10px 20px);"
      >
        <div :class="$style.previewApp" :style="previewVars">
          <div :class="$style.previewTitle">Mirage — Awakened PoE Trade</div>
          <div :class="$style.previewRow">14 divine &nbsp;•&nbsp; iLvl 85 &nbsp;•&nbsp; 4m ago</div>
          <div :class="$style.previewRowHover">15 divine &nbsp;•&nbsp; iLvl 86 &nbsp;•&nbsp; Hover</div>
        </div>
        <div :class="$style.previewHoverCard" :style="previewVars">
          <div :class="$style.previewHoverTitle">Dread Mantle — Assassin's Garb</div>
          <div :class="$style.previewHoverBody">+119 to maximum Life &nbsp;•&nbsp; Corrupted</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { configProp } from '@/web/settings/utils'
import {
  computeThemeCssVars,
  DEFAULT_THEME_CONFIG,
  normalizeThemeConfig,
  THEME_PRESETS,
  ThemeConfig
} from './theme'

type ColorFieldKey = 'panelBg' | 'surfaceBg' | 'hoverBg' | 'borderColor' | 'accentColor'

export default defineComponent({
  name: 'Theme & Colors',
  props: configProp(),
  setup (props) {
    const theme = computed<ThemeConfig>(() => normalizeThemeConfig(props.config.theme))

    function commitTheme (next: ThemeConfig) {
      props.config.theme = { ...next }
    }

    function applyPreset (presetId: string) {
      const found = THEME_PRESETS.find(p => p.id === presetId)
      if (!found) return
      commitTheme({
        preset: found.id,
        ...found.config
      })
    }

    function updateColor (key: ColorFieldKey, value: string) {
      if (!/^#[0-9a-fA-F]{6}$/.test(value.trim())) return
      commitTheme({
        ...theme.value,
        preset: 'custom',
        [key]: value.trim().toLowerCase()
      })
    }

    function onColorEvent (key: ColorFieldKey, e: Event) {
      const target = e.target as HTMLInputElement | null
      if (target) updateColor(key, target.value)
    }

    function updateOpacity (key: 'panelOpacity' | 'hoverOpacity', value: number) {
      commitTheme({
        ...theme.value,
        preset: 'custom',
        [key]: Math.round(Math.min(1, Math.max(0.5, value)) * 100) / 100
      })
    }

    function onOpacityEvent (key: 'panelOpacity' | 'hoverOpacity', e: Event) {
      const target = e.target as HTMLInputElement | null
      if (target) updateOpacity(key, Number(target.value) / 100)
    }

    function resetTheme () {
      commitTheme({ ...DEFAULT_THEME_CONFIG })
    }

    const previewVars = computed(() => computeThemeCssVars(theme.value))

    const colorFields: Array<{ key: ColorFieldKey, label: string }> = [
      { key: 'panelBg', label: 'Fundo Principal (Painel / Lista)' },
      { key: 'surfaceBg', label: 'Fundo Secundário (Título / Filtros)' },
      { key: 'hoverBg', label: 'Fundo do Hover Card (Item)' },
      { key: 'borderColor', label: 'Cor das Bordas' },
      { key: 'accentColor', label: 'Cor de Destaque (Hover / Foco)' }
    ]

    return {
      THEME_PRESETS,
      colorFields,
      theme,
      previewVars,
      applyPreset,
      onColorEvent,
      updateOpacity,
      onOpacityEvent,
      resetTheme
    }
  }
})
</script>

<style lang="postcss" module>
.presetActive {
  border-color: var(--apt-accent, #93c5fd) !important;
  color: var(--apt-text, #f1f5f9) !important;
}

.colorSwatch {
  width: 2.25rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
}

.rangeSlider {
  width: 100%;
  cursor: pointer;
}

.previewApp {
  width: 13.5rem;
  border: 1px solid var(--apt-border);
  background: var(--apt-panel-bg);
  color: var(--apt-text);
  border-radius: 0.375rem;
  overflow: hidden;
  backdrop-filter: var(--apt-blur);
  font-size: 0.75rem;
}

.previewTitle {
  background: var(--apt-surface-bg);
  color: var(--apt-text-subtle);
  border-bottom: 1px solid var(--apt-border-soft);
  padding: 0.3rem 0.5rem;
  font-weight: 600;
}

.previewRow {
  padding: 0.3rem 0.5rem;
  color: var(--apt-text-muted);
}

.previewRowHover {
  padding: 0.3rem 0.5rem;
  background: var(--apt-row-hover);
  color: var(--apt-text);
}

.previewHoverCard {
  width: 13.5rem;
  border: 1px solid #8c7a3b;
  background: var(--apt-hover-bg);
  backdrop-filter: var(--apt-hover-blur);
  border-radius: 0.25rem;
  overflow: hidden;
  text-align: center;
  font-size: 0.75rem;
}

.previewHoverTitle {
  background: linear-gradient(to bottom, rgba(96, 80, 26, 0.56), rgba(26, 22, 14, 0.93));
  border-bottom: 1px solid #8c7a3b;
  color: #ffff77;
  padding: 0.3rem 0.4rem;
  font-weight: 600;
}

.previewHoverBody {
  padding: 0.45rem 0.5rem;
  color: #8888ff;
}
</style>
