export type HoverItemRarity =
  | 'normal'
  | 'magic'
  | 'rare'
  | 'unique'
  | 'gem'
  | 'currency'
  | 'divination'
  | 'quest'
  | 'prophecy'
  | 'foil'
  | 'necropolis'

export type HoverItemSocketColor = 'R' | 'G' | 'B' | 'W' | 'A' | 'DV'

export type HoverItemInfluence =
  | 'shaper'
  | 'elder'
  | 'crusader'
  | 'redeemer'
  | 'hunter'
  | 'warlord'

export interface RawTradeApiProperty {
  name?: string
  values: Array<[string, number]>
  displayMode?: number
  type?: number
  progress?: number
}

export interface RawTradeApiSocket {
  group: number
  attr?: string
  sColour?: string
}

export interface RawTradeApiExtended {
  dps?: number
  pdps?: number
  edps?: number
  ar?: number
  ev?: number
  es?: number
  ward?: number
  text?: string
}

export interface RawTradeApiModFlags {
  fractured?: boolean
  crafted?: boolean
  veiled?: boolean
  enchant?: boolean
  scourge?: boolean
  crucible?: boolean
  mutated?: boolean
  implicit?: boolean
}

export interface RawTradeApiModEntry {
  description?: string
  domain?: string
  flags?: RawTradeApiModFlags
  hash?: string
  mods?: Array<{
    name?: string
    tier?: string
    level?: number
  }>
}

export type RawTradeApiMod = string | RawTradeApiModEntry

export interface RawTradeApiItem {
  id?: string
  name?: string
  typeLine?: string
  baseType?: string
  frameType?: number
  ilvl?: number
  identified?: boolean
  corrupted?: boolean
  duplicated?: boolean
  split?: boolean
  synthesised?: boolean
  fractured?: boolean
  searing?: boolean
  tangled?: boolean
  foilVariation?: number
  influences?: Record<string, boolean | undefined>
  sockets?: RawTradeApiSocket[] | null
  properties?: RawTradeApiProperty[] | null
  notableProperties?: RawTradeApiProperty[] | null
  requirements?: RawTradeApiProperty[] | null
  utilityMods?: RawTradeApiMod[] | null
  enchantMods?: RawTradeApiMod[] | null
  scourgeMods?: RawTradeApiMod[] | null
  implicitMods?: RawTradeApiMod[] | null
  fracturedMods?: RawTradeApiMod[] | null
  explicitMods?: RawTradeApiMod[] | null
  mutatedMods?: RawTradeApiMod[] | null
  craftedMods?: RawTradeApiMod[] | null
  veiledMods?: RawTradeApiMod[] | null
  crucibleMods?: RawTradeApiMod[] | null
  secDescrText?: string
  descrText?: string
  stackSize?: number
  maxStackSize?: number
  note?: string
  extended?: RawTradeApiExtended
}

export interface RawTradeApiListing {
  indexed: string
  price?: {
    amount: number
    currency: string
    type?: string
  }
  fee?: number
  account: {
    name: string
    lastCharacterName: string
    online?: {
      status?: string
    }
  }
}

export interface HoverItemPropertySegment {
  text: string
  colorType: number
}

export interface HoverItemProperty {
  segments: HoverItemPropertySegment[]
  progress?: number
}

export interface HoverItemRequirement {
  segments: HoverItemPropertySegment[]
}

export interface HoverItemSocket {
  group: number
  color: HoverItemSocketColor
}

export interface HoverItemDps {
  total?: number
  physical?: number
  elemental?: number
}

export interface HoverItemListingMeta {
  priceText?: string
  sellerName?: string
  isMerchant: boolean
  relativeAge?: string
}

export interface HoverItemModLine {
  text: string
  tier?: string
  eldritch?: 'searing' | 'tangled'
}

export interface TradeHoverItem {
  id: string
  name: string
  typeLine: string
  rarity: HoverItemRarity
  isDoubleHeader: boolean
  ilvl?: number
  identified: boolean
  corrupted: boolean
  duplicated: boolean
  split: boolean
  synthesised: boolean
  fractured: boolean
  searing: boolean
  tangled: boolean
  influences: HoverItemInfluence[]
  properties: HoverItemProperty[]
  notableProperties: HoverItemProperty[]
  requirements: HoverItemRequirement[]
  sockets: HoverItemSocket[]
  maxLinks: number
  dps?: HoverItemDps
  utilityMods: HoverItemModLine[]
  enchantMods: HoverItemModLine[]
  scourgeMods: HoverItemModLine[]
  implicitMods: HoverItemModLine[]
  fracturedMods: HoverItemModLine[]
  explicitMods: HoverItemModLine[]
  mutatedMods: HoverItemModLine[]
  veiledMods: HoverItemModLine[]
  craftedMods: HoverItemModLine[]
  crucibleMods: HoverItemModLine[]
  secDescrText?: string
  descrText?: string
  stackText?: string
  listing?: HoverItemListingMeta
}
