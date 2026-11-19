import { inject, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type { WidgetManager } from '@/web/overlay/interfaces'
import type { TradeHoverItem } from './types'

const SHOW_DELAY_MS = 150
const HIDE_DELAY_MS = 75

export function useHoverItem (getVisibleItems?: () => Array<{ id: string } | undefined>) {
  const wm = inject<WidgetManager | null>('wm', null)

  const activeItem = shallowRef<TradeHoverItem | null>(null)
  const anchorRect = shallowRef<DOMRect | null>(null)
  const panelRect = shallowRef<DOMRect | null>(null)
  const teleportTarget = shallowRef<HTMLElement | null>(null)

  let showTimer: ReturnType<typeof setTimeout> | null = null
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function clearTimers () {
    if (showTimer != null) {
      clearTimeout(showTimer)
      showTimer = null
    }
    if (hideTimer != null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function hideImmediately () {
    clearTimers()
    activeItem.value = null
  }

  function onRowEnter (item: TradeHoverItem | undefined, event: MouseEvent) {
    clearTimers()
    if (!item) {
      activeItem.value = null
      return
    }

    const rowEl = event.currentTarget as HTMLElement | null
    showTimer = setTimeout(() => {
      showTimer = null
      if (!rowEl || !rowEl.isConnected || rowEl.getClientRects().length === 0) {
        activeItem.value = null
        return
      }

      const widgetEl = rowEl.closest('[id^="widget-"]') as HTMLElement | null
      const overlayEl = document.getElementById('overlay-window')
      teleportTarget.value = widgetEl ?? overlayEl ?? document.body
      anchorRect.value = rowEl.getBoundingClientRect()
      panelRect.value = rowEl.closest('#price-window')?.getBoundingClientRect() ?? null
      activeItem.value = item
    }, SHOW_DELAY_MS)
  }

  function onRowLeave () {
    if (showTimer != null) {
      clearTimeout(showTimer)
      showTimer = null
    }
    if (hideTimer != null) {
      clearTimeout(hideTimer)
    }
    hideTimer = setTimeout(() => {
      hideTimer = null
      activeItem.value = null
    }, HIDE_DELAY_MS)
  }

  if (wm) {
    watch(() => wm.active.value, (isActive) => {
      if (!isActive) hideImmediately()
    })

    watch(
      () => wm.widgets.value.find(w => w.wmType === 'price-check')?.wmWants,
      (wants) => {
        if (wants === 'hide') hideImmediately()
      }
    )
  }

  if (getVisibleItems) {
    watch(getVisibleItems, (items) => {
      const current = activeItem.value
      if (!current) return
      const stillVisible = items.some(entry => entry && entry.id === current.id)
      if (!stillVisible) hideImmediately()
    })
  }

  function handleWindowBlur () {
    hideImmediately()
  }

  function handleKeyDown (e: KeyboardEvent) {
    if (e.key === 'Escape') {
      hideImmediately()
    }
  }

  onMounted(() => {
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('resize', handleWindowBlur)
    window.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    clearTimers()
    window.removeEventListener('blur', handleWindowBlur)
    window.removeEventListener('resize', handleWindowBlur)
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    activeItem,
    anchorRect,
    panelRect,
    teleportTarget,
    onRowEnter,
    onRowLeave,
    hideImmediately
  }
}
