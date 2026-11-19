export interface RectBox {
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
}

export interface HoverCardLayoutInput {
  anchorRect: RectBox
  panelRect: RectBox | null
  cardWidth: number
  cardHeight: number
  viewportWidth: number
  viewportHeight: number
  gap?: number
  margin?: number
  minScale?: number
}

export interface HoverCardLayoutResult {
  left: number
  top: number
  scale: number
  side: 'left' | 'right'
}

export function computeHoverCardLayout (input: HoverCardLayoutInput): HoverCardLayoutResult {
  const gap = input.gap ?? 12
  const margin = input.margin ?? 10
  const minScale = input.minScale ?? 0.72

  const vw = Math.max(200, input.viewportWidth)
  const vh = Math.max(200, input.viewportHeight)
  const cardW = Math.max(1, input.cardWidth)
  const cardH = Math.max(1, input.cardHeight)

  const maxAvailableHeight = Math.max(100, vh - margin * 2)
  const rawScale = cardH > maxAvailableHeight
    ? Math.max(minScale, maxAvailableHeight / cardH)
    : 1

  const maxAvailableWidth = Math.max(120, vw - margin * 2)
  const scale = cardW * rawScale > maxAvailableWidth
    ? Math.max(minScale, Math.min(rawScale, maxAvailableWidth / cardW))
    : rawScale

  const effWidth = cardW * scale
  const effHeight = cardH * scale

  const hostRect = input.panelRect ?? input.anchorRect
  const spaceLeft = hostRect.left - margin - gap
  const spaceRight = vw - hostRect.right - margin - gap

  let side: 'left' | 'right'
  if (spaceLeft >= effWidth && spaceLeft >= spaceRight) {
    side = 'left'
  } else if (spaceRight >= effWidth) {
    side = 'right'
  } else if (spaceLeft >= effWidth) {
    side = 'left'
  } else {
    side = spaceLeft >= spaceRight ? 'left' : 'right'
  }

  const rawLeft = side === 'left'
    ? hostRect.left - gap - effWidth
    : hostRect.right + gap

  const maxLeft = Math.max(margin, vw - effWidth - margin)
  const left = Math.round(Math.min(Math.max(margin, rawLeft), maxLeft))

  const anchorCenterY = input.anchorRect.top + input.anchorRect.height / 2
  const rawTop = anchorCenterY - effHeight / 2
  const maxTop = Math.max(margin, vh - effHeight - margin)
  const top = Math.round(Math.min(Math.max(margin, rawTop), maxTop))

  return {
    left,
    top,
    scale: Math.round(scale * 1000) / 1000,
    side
  }
}
