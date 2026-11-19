import {
  HoverItemDps,
  HoverItemInfluence,
  HoverItemListingMeta,
  HoverItemModLine,
  HoverItemProperty,
  HoverItemPropertySegment,
  HoverItemRarity,
  HoverItemRequirement,
  HoverItemSocket,
  HoverItemSocketColor,
  RawTradeApiItem,
  RawTradeApiListing,
  RawTradeApiMod,
  RawTradeApiProperty,
  RawTradeApiSocket,
  TradeHoverItem
} from './types'

const FRAME_TYPE_TO_RARITY: Record<number, HoverItemRarity> = {
  0: 'normal',
  1: 'magic',
  2: 'rare',
  3: 'unique',
  4: 'gem',
  5: 'currency',
  6: 'divination',
  7: 'quest',
  8: 'prophecy',
  9: 'foil',
  10: 'necropolis'
}

const KNOWN_INFLUENCES: HoverItemInfluence[] = [
  'shaper',
  'elder',
  'crusader',
  'redeemer',
  'hunter',
  'warlord'
]

const SOCKET_COLOR_BY_SCOLOUR: Record<string, HoverItemSocketColor> = {
  R: 'R',
  G: 'G',
  B: 'B',
  W: 'W',
  A: 'A',
  DV: 'DV'
}

const SOCKET_COLOR_BY_ATTR: Record<string, HoverItemSocketColor> = {
  S: 'R',
  D: 'G',
  I: 'B',
  G: 'W',
  A: 'A',
  DV: 'DV'
}

export function cleanPoeText (text?: unknown): string {
  if (text == null) return ''
  const str = typeof text === 'string'
    ? text
    : (typeof text === 'number' ? String(text) : '')
  if (!str) return ''
  return str
    .replace(/<<[^>]+>>/g, '')
    .replace(/<(if:[^>]*)>\{([^}]*)\}/g, '$2')
    .replace(/<(?:elif|else)[^>]*>\{[^}]*\}/g, '')
    .trim()
}

export function mapFrameTypeToRarity (frameType?: number): HoverItemRarity {
  if (frameType == null) return 'normal'
  return FRAME_TYPE_TO_RARITY[frameType] ?? 'normal'
}

export function formatProperty (prop: RawTradeApiProperty): HoverItemProperty | null {
  if (!prop || typeof prop !== 'object') return null

  const rawName = cleanPoeText(prop.name)
  const values = Array.isArray(prop.values) ? prop.values : []
  const displayMode = prop.displayMode ?? 0

  if (displayMode === 3 && rawName) {
    const segments: HoverItemPropertySegment[] = []
    const tokenRegex = /(?:%(\d+)|\{(\d+)\})/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = tokenRegex.exec(rawName)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: rawName.slice(lastIndex, match.index), colorType: -1 })
      }
      const valueIdx = Number(match[1] ?? match[2])
      const entry = values[valueIdx]
      if (Array.isArray(entry)) {
        segments.push({
          text: cleanPoeText(entry[0]),
          colorType: typeof entry[1] === 'number' ? entry[1] : 0
        })
      } else {
        segments.push({ text: match[0], colorType: 0 })
      }
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < rawName.length) {
      segments.push({ text: rawName.slice(lastIndex), colorType: -1 })
    }

    if (segments.length === 0) return null
    return { segments, progress: prop.progress }
  }

  if (displayMode === 1) {
    const segments: HoverItemPropertySegment[] = []
    values.forEach((entry, idx) => {
      if (!Array.isArray(entry)) return
      if (idx > 0) segments.push({ text: ', ', colorType: -1 })
      segments.push({
        text: cleanPoeText(entry[0]),
        colorType: typeof entry[1] === 'number' ? entry[1] : 0
      })
    })
    if (rawName) {
      if (segments.length > 0) segments.push({ text: ' ', colorType: -1 })
      segments.push({ text: rawName, colorType: -1 })
    }
    if (segments.length === 0) return null
    return { segments, progress: prop.progress }
  }

  if (!rawName && values.length === 0) return null

  const segments: HoverItemPropertySegment[] = []
  if (rawName) {
    const label = values.length > 0 && !rawName.endsWith(':')
      ? `${rawName}: `
      : (values.length > 0 ? `${rawName} ` : rawName)
    segments.push({ text: label, colorType: -1 })
  }

  values.forEach((entry, idx) => {
    if (!Array.isArray(entry)) return
    if (idx > 0) segments.push({ text: ', ', colorType: -1 })
    segments.push({
      text: cleanPoeText(entry[0]),
      colorType: typeof entry[1] === 'number' ? entry[1] : 0
    })
  })

  return { segments, progress: prop.progress }
}

export function formatRequirements (reqs?: RawTradeApiProperty[] | null): HoverItemRequirement[] {
  if (!Array.isArray(reqs) || reqs.length === 0) return []

  const out: HoverItemRequirement[] = []
  for (const req of reqs) {
    if (!req || typeof req !== 'object') continue

    const cleanName = cleanPoeText(req.name).replace(/^Requires\s+/i, '')
    const values = Array.isArray(req.values) ? req.values : []
    const displayMode = req.displayMode ?? 0

    if (displayMode === 3 && cleanName) {
      const formatted = formatProperty({ ...req, name: cleanName })
      if (formatted) out.push({ segments: formatted.segments })
      continue
    }

    if (displayMode === 1) {
      const segments: HoverItemPropertySegment[] = []
      values.forEach((entry, idx) => {
        if (!Array.isArray(entry)) return
        if (idx > 0) segments.push({ text: ' ', colorType: -1 })
        segments.push({
          text: cleanPoeText(entry[0]),
          colorType: typeof entry[1] === 'number' ? entry[1] : 0
        })
      })
      if (cleanName) {
        if (segments.length > 0) segments.push({ text: ' ', colorType: -1 })
        segments.push({ text: cleanName, colorType: -1 })
      }
      if (segments.length > 0) out.push({ segments })
      continue
    }

    const segments: HoverItemPropertySegment[] = []
    if (cleanName) {
      segments.push({ text: cleanName, colorType: -1 })
    }
    values.forEach((entry, idx) => {
      if (!Array.isArray(entry)) return
      if (segments.length > 0) segments.push({ text: idx === 0 ? ' ' : ', ', colorType: -1 })
      segments.push({
        text: cleanPoeText(entry[0]),
        colorType: typeof entry[1] === 'number' ? entry[1] : 0
      })
    })
    if (segments.length > 0) out.push({ segments })
  }

  return out
}

export function normalizeSockets (
  rawSockets?: RawTradeApiSocket[] | null
): { sockets: HoverItemSocket[], maxLinks: number } {
  if (!Array.isArray(rawSockets) || rawSockets.length === 0) {
    return { sockets: [], maxLinks: 0 }
  }

  const groupCounts = new Map<number, number>()
  const sockets: HoverItemSocket[] = []

  for (const raw of rawSockets) {
    if (!raw || typeof raw !== 'object') continue

    const sColour = typeof raw.sColour === 'string' ? raw.sColour.toUpperCase() : ''
    const attr = typeof raw.attr === 'string' ? raw.attr.toUpperCase() : ''
    const color: HoverItemSocketColor =
      SOCKET_COLOR_BY_SCOLOUR[sColour] ??
      SOCKET_COLOR_BY_ATTR[attr] ??
      'W'

    const group = typeof raw.group === 'number' ? raw.group : sockets.length
    sockets.push({ group, color })
    groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1)
  }

  let maxLinks = 0
  for (const count of groupCounts.values()) {
    if (count > maxLinks) maxLinks = count
  }

  return { sockets, maxLinks }
}

export function formatVeiledMod (raw: RawTradeApiMod): string {
  const cleaned = extractModText(raw)
  if (/prefix/i.test(cleaned)) return 'Veiled Prefix'
  if (/suffix/i.test(cleaned)) return 'Veiled Suffix'
  return 'Veiled Modifier'
}

export function extractModText (mod: RawTradeApiMod): string {
  if (typeof mod === 'string') {
    return cleanPoeText(mod)
  }
  if (mod && typeof mod === 'object') {
    return cleanPoeText(mod.description)
  }
  return ''
}

function extractTier (entry: RawTradeApiMod, isCrafted: boolean): string | undefined {
  if (isCrafted) return 'Craft'
  if (!entry || typeof entry !== 'object' || !Array.isArray(entry.mods)) return undefined

  const tiers: string[] = []
  for (const mod of entry.mods) {
    if (!mod || typeof mod.tier !== 'string') continue
    const clean = mod.tier.trim()
    if (clean && !tiers.includes(clean)) {
      tiers.push(clean)
    }
  }
  return tiers.length > 0 ? tiers.join('/') : undefined
}

function toModLines (mods?: RawTradeApiMod[] | null, isCrafted = false): HoverItemModLine[] {
  if (!Array.isArray(mods)) return []
  const out: HoverItemModLine[] = []
  for (const entry of mods) {
    const text = extractModText(entry)
    if (!text) continue
    out.push({
      text,
      tier: extractTier(entry, isCrafted)
    })
  }
  return out
}

function decodeBase64Utf8 (b64?: string): string {
  if (!b64 || typeof b64 !== 'string') return ''
  try {
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

function resolveEldritchImplicits (
  mods: HoverItemModLine[],
  item: RawTradeApiItem
): HoverItemModLine[] {
  if (mods.length === 0) return mods
  const hasSearing = Boolean(item.searing)
  const hasTangled = Boolean(item.tangled)
  if (!hasSearing && !hasTangled) return mods

  if (hasSearing && !hasTangled) {
    return mods.map(m => ({ ...m, eldritch: 'searing' }))
  }
  if (hasTangled && !hasSearing) {
    return mods.map(m => ({ ...m, eldritch: 'tangled' }))
  }

  let ordered = [...mods]
  const rawText = decodeBase64Utf8(item.extended?.text)
  if (rawText && ordered.length >= 2) {
    const indexed = ordered.map((mod, idx) => ({
      mod,
      idx,
      pos: rawText.indexOf(mod.text)
    }))
    if (indexed.every(entry => entry.pos >= 0)) {
      indexed.sort((a, b) => a.pos - b.pos)
      ordered = indexed.map(entry => entry.mod)
    }
  }

  return ordered.map((mod, idx) => ({
    ...mod,
    eldritch: idx === 0 ? 'searing' : (idx === 1 ? 'tangled' : undefined)
  }))
}

function roundDps (val?: number): number | undefined {
  if (typeof val !== 'number' || !Number.isFinite(val) || val <= 0) return undefined
  return Math.round(val * 10) / 10
}

function extractDps (item: RawTradeApiItem): HoverItemDps | undefined {
  const ext = item.extended
  if (!ext || typeof ext !== 'object') return undefined
  const total = roundDps(ext.dps)
  const physical = roundDps(ext.pdps)
  const elemental = roundDps(ext.edps)
  if (total == null && physical == null && elemental == null) return undefined
  return { total, physical, elemental }
}

function extractInfluences (item: RawTradeApiItem): HoverItemInfluence[] {
  if (!item.influences || typeof item.influences !== 'object') return []
  return KNOWN_INFLUENCES.filter(inf => item.influences?.[inf] === true)
}

function extractListingMeta (
  listing?: RawTradeApiListing,
  relativeAge?: string
): HoverItemListingMeta | undefined {
  if (!listing || typeof listing !== 'object') return undefined

  const priceText = listing.price
    ? `${listing.price.amount} ${listing.price.currency}`
    : undefined
  const account = listing.account
  const sellerName = account
    ? cleanPoeText(account.lastCharacterName || account.name) || undefined
    : undefined
  const isMerchant = listing.fee != null

  if (!priceText && !sellerName && !relativeAge) return undefined
  return {
    priceText,
    sellerName,
    isMerchant,
    relativeAge: relativeAge || undefined
  }
}

export function extractHoverItem (
  item: RawTradeApiItem,
  listing?: RawTradeApiListing,
  id?: string,
  relativeAge?: string
): TradeHoverItem | undefined {
  try {
    if (!item || typeof item !== 'object') return undefined

    const rarity = mapFrameTypeToRarity(item.frameType)
    const name = cleanPoeText(item.name)
    const typeLine = cleanPoeText(item.typeLine || item.baseType) || name
    const isDoubleHeader = name.length > 0 && (
      rarity === 'rare' ||
      rarity === 'unique' ||
      rarity === 'foil' ||
      rarity === 'necropolis'
    )

    const properties = (item.properties ?? [])
      .map(formatProperty)
      .filter((p): p is HoverItemProperty => p !== null)

    const notableProperties = (item.notableProperties ?? [])
      .map(formatProperty)
      .filter((p): p is HoverItemProperty => p !== null)

    const { sockets, maxLinks } = normalizeSockets(item.sockets)

    const stackText = item.stackSize != null
      ? (item.maxStackSize != null ? `${item.stackSize}/${item.maxStackSize}` : `${item.stackSize}`)
      : undefined

    const enchantMods = toModLines(item.enchantMods)
    const scourgeMods = toModLines(item.scourgeMods)
    const fracturedMods = toModLines(item.fracturedMods)
    const craftedMods = toModLines(item.craftedMods, true)
    const mutatedMods = toModLines(item.mutatedMods)
    const crucibleMods = toModLines(item.crucibleMods)
    const veiledMods: HoverItemModLine[] = (item.veiledMods ?? []).map(entry => ({
      text: formatVeiledMod(entry)
    }))
    const explicitMods: HoverItemModLine[] = []

    for (const entry of item.explicitMods ?? []) {
      const text = extractModText(entry)
      const isObj = entry != null && typeof entry === 'object'
      const flags = isObj ? entry.flags : undefined
      const domain = isObj && typeof entry.domain === 'string' ? entry.domain.toLowerCase() : ''

      if (flags?.fractured || domain === 'fractured') {
        if (text) fracturedMods.push({ text, tier: extractTier(entry, false) })
      } else if (flags?.crafted || domain === 'crafted') {
        if (text) craftedMods.push({ text, tier: 'Craft' })
      } else if (flags?.veiled || domain === 'veiled') {
        if (!text || /^(?:Prefix|Suffix)\d*$/i.test(text)) {
          veiledMods.push({ text: formatVeiledMod(entry) })
        } else {
          veiledMods.push({ text, tier: extractTier(entry, false) })
        }
      } else if (flags?.scourge || domain === 'scourge') {
        if (text) scourgeMods.push({ text, tier: extractTier(entry, false) })
      } else if (flags?.crucible || domain === 'crucible') {
        if (text) crucibleMods.push({ text, tier: extractTier(entry, false) })
      } else if (flags?.mutated || domain === 'mutated') {
        if (text) mutatedMods.push({ text, tier: extractTier(entry, false) })
      } else if (flags?.enchant || domain === 'enchant') {
        if (text) enchantMods.push({ text, tier: extractTier(entry, false) })
      } else if (text) {
        explicitMods.push({ text, tier: extractTier(entry, false) })
      }
    }

    const implicitMods = resolveEldritchImplicits(toModLines(item.implicitMods), item)

    return {
      id: id ?? item.id ?? `${name}-${typeLine}`,
      name,
      typeLine,
      rarity,
      isDoubleHeader,
      ilvl: typeof item.ilvl === 'number' && item.ilvl > 0 ? item.ilvl : undefined,
      identified: item.identified !== false,
      corrupted: Boolean(item.corrupted),
      duplicated: Boolean(item.duplicated),
      split: Boolean(item.split),
      synthesised: Boolean(item.synthesised),
      fractured: Boolean(item.fractured) || fracturedMods.length > 0,
      searing: Boolean(item.searing),
      tangled: Boolean(item.tangled),
      influences: extractInfluences(item),
      properties,
      notableProperties,
      requirements: formatRequirements(item.requirements),
      sockets,
      maxLinks,
      dps: extractDps(item),
      utilityMods: toModLines(item.utilityMods),
      enchantMods,
      scourgeMods,
      implicitMods,
      fracturedMods,
      explicitMods,
      mutatedMods,
      veiledMods,
      craftedMods,
      crucibleMods,
      secDescrText: cleanPoeText(item.secDescrText) || undefined,
      descrText: cleanPoeText(item.descrText) || undefined,
      stackText,
      listing: extractListingMeta(listing, relativeAge)
    }
  } catch {
    return undefined
  }
}
