<template>
  <Teleport v-if="item && teleportTarget" :to="teleportTarget">
    <div
      ref="cardEl"
      role="tooltip"
      aria-hidden="true"
      :class="[$style.card, $style[`rarity_${item.rarity}`]]"
      :style="cardStyle"
    >
      <div :class="[$style.header, item.isDoubleHeader ? $style.headerDouble : $style.headerSingle]">
        <div :class="$style.headerAdornmentLeft">
          <img
            v-if="leftInfluenceIcon"
            :src="leftInfluenceIcon"
            :class="$style.influenceImg"
            alt=""
          >
          <svg
            v-else-if="leftSpecialBadge === 'searing'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <circle cx="8" cy="8" r="5" fill="#d94e28" stroke="#f6ad55" stroke-width="1.2" />
            <circle cx="8" cy="8" r="2" fill="#fff5eb" />
          </svg>
          <svg
            v-else-if="leftSpecialBadge === 'tangled'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <polygon points="8,2 14,8 8,14 2,8" fill="#2b6cb0" stroke="#90cdf4" stroke-width="1.2" />
            <circle cx="8" cy="8" r="2.2" fill="#ebf8ff" />
          </svg>
          <svg
            v-else-if="leftSpecialBadge === 'synthesised'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <polygon points="8,2 13,5 13,11 8,14 3,11 3,5" fill="#2c5282" stroke="#90cdf4" stroke-width="1.2" />
          </svg>
          <svg
            v-else-if="leftSpecialBadge === 'fractured'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <polygon points="8,2 13,8 8,14 3,8" fill="#5c4928" stroke="#e4c29a" stroke-width="1.2" />
          </svg>
        </div>

        <div :class="$style.headerTitles">
          <div v-if="item.isDoubleHeader" :class="$style.itemName">{{ item.name }}</div>
          <div :class="$style.itemType">{{ item.isDoubleHeader ? item.typeLine : (item.name || item.typeLine) }}</div>
        </div>

        <div :class="$style.headerAdornmentRight">
          <img
            v-if="rightInfluenceIcon"
            :src="rightInfluenceIcon"
            :class="$style.influenceImg"
            alt=""
          >
          <svg
            v-else-if="rightSpecialBadge === 'tangled'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <polygon points="8,2 14,8 8,14 2,8" fill="#2b6cb0" stroke="#90cdf4" stroke-width="1.2" />
            <circle cx="8" cy="8" r="2.2" fill="#ebf8ff" />
          </svg>
          <svg
            v-else-if="rightSpecialBadge === 'searing'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <circle cx="8" cy="8" r="5" fill="#d94e28" stroke="#f6ad55" stroke-width="1.2" />
            <circle cx="8" cy="8" r="2" fill="#fff5eb" />
          </svg>
          <svg
            v-else-if="rightSpecialBadge === 'synthesised'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <polygon points="8,2 13,5 13,11 8,14 3,11 3,5" fill="#2c5282" stroke="#90cdf4" stroke-width="1.2" />
          </svg>
          <svg
            v-else-if="rightSpecialBadge === 'fractured'"
            viewBox="0 0 16 16"
            :class="$style.badgeSvg"
          >
            <polygon points="8,2 13,8 8,14 3,8" fill="#5c4928" stroke="#e4c29a" stroke-width="1.2" />
          </svg>
        </div>
      </div>

      <div :class="$style.body">
        <template v-if="hasPropertiesBlock">
          <div :class="$style.section">
            <div v-for="(prop, idx) in item.properties" :key="`p-${idx}`" :class="$style.propLine">
              <span
                v-for="(seg, sIdx) in prop.segments"
                :key="sIdx"
                :class="$style[segmentColorClass(seg.colorType)]"
              >{{ seg.text }}</span>
            </div>
            <div v-for="(prop, idx) in item.notableProperties" :key="`np-${idx}`" :class="$style.propLine">
              <span
                v-for="(seg, sIdx) in prop.segments"
                :key="sIdx"
                :class="$style[segmentColorClass(seg.colorType)]"
              >{{ seg.text }}</span>
            </div>
            <div v-if="item.dps" :class="$style.dpsRow">
              <span v-if="item.dps.total != null">
                <span :class="$style.colorLabel">DPS: </span>
                <span :class="$style.colorWhite">{{ item.dps.total }}</span>
              </span>
              <span v-if="item.dps.physical != null">
                <span :class="$style.colorLabel">pDPS: </span>
                <span :class="$style.colorWhite">{{ item.dps.physical }}</span>
              </span>
              <span v-if="item.dps.elemental != null">
                <span :class="$style.colorLabel">eDPS: </span>
                <span :class="$style.colorAugmented">{{ item.dps.elemental }}</span>
              </span>
            </div>
            <div v-if="item.stackText && !hasStackProperty" :class="$style.propLine">
              <span :class="$style.colorLabel">Stack Size: </span>
              <span :class="$style.colorWhite">{{ item.stackText }}</span>
            </div>
          </div>
        </template>

        <template v-if="hasMetaBlock">
          <div v-if="hasPropertiesBlock" :class="$style.divider" />
          <div :class="$style.section">
            <div v-if="item.ilvl != null" :class="$style.propLine">
              <span :class="$style.colorLabel">Item Level: </span>
              <span :class="$style.colorWhite">{{ item.ilvl }}</span>
            </div>
            <div v-if="item.requirements.length > 0" :class="$style.propLine">
              <span :class="$style.colorLabel">Requires </span>
              <template v-for="(req, rIdx) in item.requirements" :key="rIdx">
                <span v-if="rIdx > 0" :class="$style.colorLabel">, </span>
                <span
                  v-for="(seg, sIdx) in req.segments"
                  :key="sIdx"
                  :class="$style[segmentColorClass(seg.colorType)]"
                >{{ seg.text }}</span>
              </template>
            </div>
          </div>
        </template>

        <template v-if="item.sockets.length > 0">
          <div v-if="hasPropertiesBlock || hasMetaBlock" :class="$style.divider" />
          <trade-hover-sockets :sockets="item.sockets" :max-links="item.maxLinks" />
        </template>

        <template v-if="item.utilityMods.length > 0">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div v-for="(mod, idx) in item.utilityMods" :key="`u-${idx}`" :class="$style.modUtility">{{ mod.text }}</div>
          </div>
        </template>

        <template v-if="item.enchantMods.length > 0">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div v-for="(mod, idx) in item.enchantMods" :key="`e-${idx}`" :class="$style.modEnchant">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
          </div>
        </template>

        <template v-if="item.scourgeMods.length > 0">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div v-for="(mod, idx) in item.scourgeMods" :key="`sc-${idx}`" :class="$style.modScourge">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
          </div>
        </template>

        <template v-if="item.implicitMods.length > 0">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div
              v-for="(mod, idx) in item.implicitMods"
              :key="`im-${idx}`"
              :class="[
                mod.eldritch === 'searing'
                  ? $style.modTagSearing
                  : mod.eldritch === 'tangled'
                    ? $style.modTagTangled
                    : $style.modExplicit,
                $style.modLine
              ]"
            >
              <svg v-if="mod.eldritch === 'searing'" viewBox="0 0 12 12" :class="$style.inlineSigil" aria-hidden="true">
                <circle cx="6" cy="6" r="4" fill="#d94e28" stroke="#f6ad55" stroke-width="1.1" />
                <circle cx="6" cy="6" r="1.4" fill="#fff5eb" />
              </svg>
              <svg v-else-if="mod.eldritch === 'tangled'" viewBox="0 0 12 12" :class="$style.inlineSigil" aria-hidden="true">
                <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#2b6cb0" stroke="#90cdf4" stroke-width="1.1" />
                <circle cx="6" cy="6" r="1.5" fill="#ebf8ff" />
              </svg>
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
          </div>
        </template>

        <template v-if="hasPrimaryModsBlock">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div v-if="!item.identified" :class="$style.modCorrupted">Unidentified</div>
            <div v-for="(mod, idx) in item.fracturedMods" :key="`fr-${idx}`" :class="[$style.modFractured, $style.modLine]">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
            <div v-for="(mod, idx) in item.explicitMods" :key="`ex-${idx}`" :class="[$style.modExplicit, $style.modLine]">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
            <div v-for="(mod, idx) in item.mutatedMods" :key="`mu-${idx}`" :class="[$style.modMutated, $style.modLine]">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
            <div v-for="(mod, idx) in item.veiledMods" :key="`ve-${idx}`" :class="[$style.modVeiled, $style.modLine]">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
            <div v-for="(mod, idx) in item.craftedMods" :key="`cr-${idx}`" :class="[$style.modCrafted, $style.modLine]">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
            <div v-for="(mod, idx) in item.crucibleMods" :key="`cu-${idx}`" :class="[$style.modCrucible, $style.modLine]">
              <span v-if="mod.tier" :class="$style.tierBadge">{{ mod.tier }}</span><span>{{ mod.text }}</span>
            </div>
          </div>
        </template>

        <template v-if="hasStatusBlock">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div v-if="item.corrupted" :class="$style.modCorrupted">Corrupted</div>
            <div v-if="item.duplicated" :class="$style.modMirrored">Mirrored</div>
            <div v-if="item.split" :class="$style.modSplit">Split</div>
            <div v-if="item.synthesised" :class="$style.modTagInfo">Synthesised Item</div>
            <div v-if="item.searing" :class="$style.modTagSearing">Searing Exarch Item</div>
            <div v-if="item.tangled" :class="$style.modTagTangled">Eater of Worlds Item</div>
          </div>
        </template>

        <template v-if="showDescrBlock">
          <div :class="$style.divider" />
          <div :class="$style.section">
            <div v-if="item.secDescrText" :class="$style.descrText">{{ item.secDescrText }}</div>
            <div v-if="item.descrText" :class="$style.descrText">{{ item.descrText }}</div>
          </div>
        </template>

        <template v-if="item.listing">
          <div :class="$style.divider" />
          <div :class="$style.listingFooter">
            <span v-if="item.listing.priceText" :class="$style.listingPrice">{{ item.listing.priceText }}</span>
            <span v-if="item.listing.sellerName" :class="$style.listingSeller">{{ item.listing.sellerName }}</span>
            <span v-if="item.listing.relativeAge" :class="$style.listingAge">{{ item.listing.relativeAge }}</span>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, PropType, ref, shallowRef, watch } from 'vue'
import { computeHoverCardLayout, HoverCardLayoutResult } from './positioning'
import TradeHoverSockets from './TradeHoverSockets.vue'
import type { HoverItemInfluence, TradeHoverItem } from './types'

const INFLUENCE_IMAGE: Record<HoverItemInfluence, string> = {
  shaper: '/images/influence-Shaper.png',
  elder: '/images/influence-Elder.png',
  crusader: '/images/influence-Crusader.png',
  redeemer: '/images/influence-Redeemer.png',
  hunter: '/images/influence-Hunter.png',
  warlord: '/images/influence-Warlord.png'
}

const VALUE_COLOR_CLASSES: Record<number, string> = {
  [-1]: 'colorLabel',
  0: 'colorWhite',
  1: 'colorAugmented',
  2: 'colorUnmet',
  4: 'colorFire',
  5: 'colorCold',
  6: 'colorLightning',
  7: 'colorChaos'
}

export default defineComponent({
  name: 'TradeHoverCard',
  components: {
    TradeHoverSockets
  },
  props: {
    item: {
      type: Object as PropType<TradeHoverItem | null>,
      default: null
    },
    anchorRect: {
      type: Object as PropType<DOMRect | null>,
      default: null
    },
    panelRect: {
      type: Object as PropType<DOMRect | null>,
      default: null
    },
    teleportTarget: {
      type: Object as PropType<HTMLElement | null>,
      default: null
    }
  },
  setup (props) {
    const cardEl = ref<HTMLElement | null>(null)
    const layout = shallowRef<HoverCardLayoutResult | null>(null)
    let resizeObserver: ResizeObserver | null = null

    function updatePosition () {
      const el = cardEl.value
      const anchor = props.anchorRect
      if (!el || !anchor) {
        layout.value = null
        return
      }

      const cardWidth = el.offsetWidth
      const cardHeight = el.offsetHeight
      if (cardWidth <= 0 || cardHeight <= 0) {
        return
      }

      layout.value = computeHoverCardLayout({
        anchorRect: {
          left: anchor.left,
          right: anchor.right,
          top: anchor.top,
          bottom: anchor.bottom,
          width: anchor.width,
          height: anchor.height
        },
        panelRect: props.panelRect
          ? {
              left: props.panelRect.left,
              right: props.panelRect.right,
              top: props.panelRect.top,
              bottom: props.panelRect.bottom,
              width: props.panelRect.width,
              height: props.panelRect.height
            }
          : null,
        cardWidth,
        cardHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      })
    }

    watch(
      () => [props.item, props.anchorRect, props.panelRect, props.teleportTarget],
      () => {
        if (!props.item || !props.anchorRect) {
          layout.value = null
          return
        }
        nextTick(updatePosition)
      },
      { immediate: true }
    )

    watch(cardEl, (el) => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      if (el) {
        resizeObserver = new ResizeObserver(() => {
          updatePosition()
        })
        resizeObserver.observe(el)
        nextTick(updatePosition)
      }
    })

    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    })

    const cardStyle = computed<Record<string, string>>(() => {
      if (!layout.value) {
        return {
          left: '-9999px',
          top: '-9999px',
          opacity: '0'
        }
      }
      const style: Record<string, string> = {
        left: `${layout.value.left}px`,
        top: `${layout.value.top}px`,
        opacity: '1'
      }
      if (layout.value.scale < 1) {
        style.transform = `scale(${layout.value.scale})`
      }
      return style
    })

    const leftInfluenceIcon = computed(() => {
      const inf = props.item?.influences[0]
      return inf ? INFLUENCE_IMAGE[inf] : null
    })

    const rightInfluenceIcon = computed(() => {
      const infs = props.item?.influences ?? []
      if (infs.length >= 2) return INFLUENCE_IMAGE[infs[1]]
      if (infs.length === 1) return INFLUENCE_IMAGE[infs[0]]
      return null
    })

    const leftSpecialBadge = computed(() => {
      const item = props.item
      if (!item) return null
      if (item.searing) return 'searing'
      if (item.tangled) return 'tangled'
      if (item.synthesised) return 'synthesised'
      if (item.fractured) return 'fractured'
      return null
    })

    const rightSpecialBadge = computed(() => {
      const item = props.item
      if (!item) return null
      if (item.tangled && item.searing) return 'tangled'
      if (item.tangled) return 'tangled'
      if (item.searing) return 'searing'
      if (item.synthesised) return 'synthesised'
      if (item.fractured) return 'fractured'
      return null
    })

    const hasStackProperty = computed(() => {
      return (props.item?.properties ?? []).some(p =>
        p.segments.some(s => /stack size/i.test(s.text))
      )
    })

    const hasPropertiesBlock = computed(() => {
      const item = props.item
      if (!item) return false
      return item.properties.length > 0 ||
        item.notableProperties.length > 0 ||
        item.dps != null ||
        (item.stackText != null && !hasStackProperty.value)
    })

    const hasMetaBlock = computed(() => {
      const item = props.item
      if (!item) return false
      return item.ilvl != null || item.requirements.length > 0
    })

    const hasPrimaryModsBlock = computed(() => {
      const item = props.item
      if (!item) return false
      return !item.identified ||
        item.fracturedMods.length > 0 ||
        item.explicitMods.length > 0 ||
        item.mutatedMods.length > 0 ||
        item.veiledMods.length > 0 ||
        item.craftedMods.length > 0 ||
        item.crucibleMods.length > 0
    })

    const hasStatusBlock = computed(() => {
      const item = props.item
      if (!item) return false
      return item.corrupted ||
        item.duplicated ||
        item.split ||
        item.synthesised ||
        item.searing ||
        item.tangled
    })

    const showDescrBlock = computed(() => {
      const item = props.item
      if (!item) return false
      if (!item.secDescrText && !item.descrText) return false
      return !hasPrimaryModsBlock.value || item.rarity === 'gem' || item.rarity === 'currency'
    })

    function segmentColorClass (colorType: number): string {
      return VALUE_COLOR_CLASSES[colorType] ?? 'colorWhite'
    }

    return {
      cardEl,
      cardStyle,
      leftInfluenceIcon,
      rightInfluenceIcon,
      leftSpecialBadge,
      rightSpecialBadge,
      hasStackProperty,
      hasPropertiesBlock,
      hasMetaBlock,
      hasPrimaryModsBlock,
      hasStatusBlock,
      showDescrBlock,
      segmentColorClass
    }
  }
})
</script>

<style lang="postcss" module>
.card {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  transform-origin: top left;
  width: max-content;
  min-width: 19.5rem;
  max-width: 30rem;
  background: rgba(10, 12, 16, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--poe-border, #5a5245);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.86), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: #b4b4b4;
  text-align: center;
  font-family: Fontin, FrizQuadrataC, sans-serif;
  transition: opacity 120ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}

.rarity_normal {
  --poe-title: #c8c8c8;
  --poe-border: #6f6f6f;
  --poe-header-bg: linear-gradient(to bottom, rgba(72, 72, 72, 0.42), rgba(20, 22, 26, 0.9));
}

.rarity_magic {
  --poe-title: #8888ff;
  --poe-border: #48549c;
  --poe-header-bg: linear-gradient(to bottom, rgba(35, 53, 125, 0.52), rgba(14, 18, 36, 0.92));
}

.rarity_rare {
  --poe-title: #ffff77;
  --poe-border: #8c7a3b;
  --poe-header-bg: linear-gradient(to bottom, rgba(96, 80, 26, 0.56), rgba(26, 22, 14, 0.93));
}

.rarity_unique {
  --poe-title: #d67a32;
  --poe-border: #87461d;
  --poe-header-bg: linear-gradient(to bottom, rgba(92, 41, 14, 0.58), rgba(26, 15, 10, 0.93));
}

.rarity_gem {
  --poe-title: #1ba29b;
  --poe-border: #206b67;
  --poe-header-bg: linear-gradient(to bottom, rgba(19, 77, 74, 0.55), rgba(11, 24, 24, 0.93));
}

.rarity_currency {
  --poe-title: #aa9e82;
  --poe-border: #7a6f56;
  --poe-header-bg: linear-gradient(to bottom, rgba(77, 68, 52, 0.55), rgba(22, 19, 15, 0.93));
}

.rarity_divination {
  --poe-title: #0ebaff;
  --poe-border: #2b7aa1;
  --poe-header-bg: linear-gradient(to bottom, rgba(19, 68, 96, 0.55), rgba(12, 22, 32, 0.93));
}

.rarity_quest {
  --poe-title: #4ae63a;
  --poe-border: #3a8532;
  --poe-header-bg: linear-gradient(to bottom, rgba(33, 84, 27, 0.55), rgba(13, 26, 12, 0.93));
}

.rarity_prophecy {
  --poe-title: #b54bff;
  --poe-border: #6c3296;
  --poe-header-bg: linear-gradient(to bottom, rgba(72, 26, 104, 0.55), rgba(20, 12, 30, 0.93));
}

.rarity_foil {
  --poe-title: #82ad6a;
  --poe-border: #5a8248;
  --poe-header-bg: linear-gradient(to bottom, rgba(50, 79, 44, 0.58), rgba(16, 26, 17, 0.93));
}

.rarity_necropolis {
  --poe-title: #7ec2c2;
  --poe-border: #467878;
  --poe-header-bg: linear-gradient(to bottom, rgba(38, 72, 74, 0.56), rgba(14, 22, 25, 0.93));
}

.header {
  display: grid;
  grid-template-columns: 1.5rem 1fr 1.5rem;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.5rem;
  background: var(--poe-header-bg);
  border-bottom: 1px solid var(--poe-border, #5a5245);
  font-family: FontinSmallCaps, FrizQuadrataC, sans-serif;
  color: var(--poe-title, #c8c8c8);
}

.headerSingle {
  min-height: 2.1rem;
}

.headerDouble {
  min-height: 3rem;
}

.headerAdornmentLeft,
.headerAdornmentRight {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
}

.influenceImg {
  width: 1.2rem;
  height: 1.2rem;
  object-fit: contain;
}

.badgeSvg {
  width: 1rem;
  height: 1rem;
}

.headerTitles {
  min-width: 0;
  line-height: 1.2;
}

.itemName {
  font-size: 1.02rem;
  letter-spacing: 0.02em;
}

.itemType {
  font-size: 0.96rem;
  letter-spacing: 0.015em;
}

.body {
  padding: 0.45rem 0.75rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.32;
}

.section {
  padding: 0.1rem 0;
}

.propLine {
  white-space: normal;
}

.modLine {
  margin-top: 0.08rem;
}

.tierBadge {
  display: inline-block;
  vertical-align: baseline;
  margin-right: 0.35rem;
  padding: 0.04rem 0.3rem;
  border-radius: 0.2rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.6875rem;
  line-height: 1.15;
  letter-spacing: 0.01em;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.inlineSigil {
  display: inline-block;
  vertical-align: -0.1rem;
  width: 0.72rem;
  height: 0.72rem;
  margin-right: 0.3rem;
}

.dpsRow {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.1rem;
  font-size: 0.8125rem;
}

.divider {
  height: 1px;
  margin: 0.375rem 0.25rem;
  background: linear-gradient(
    to right,
    transparent,
    var(--poe-border, #5a5245) 20%,
    var(--poe-border, #5a5245) 80%,
    transparent
  );
  opacity: 0.75;
}

.colorLabel {
  color: #8f8f8f;
}

.colorWhite {
  color: #ffffff;
}

.colorAugmented {
  color: #8888ff;
}

.colorUnmet {
  color: #e03c3c;
}

.colorFire {
  color: #e06040;
}

.colorCold {
  color: #64a8ff;
}

.colorLightning {
  color: #ffd700;
}

.colorChaos {
  color: #d848b8;
}

.modUtility {
  color: #8888ff;
  white-space: pre-line;
}

.modEnchant {
  color: #b8b8ff;
  white-space: pre-line;
}

.modScourge {
  color: #ff6e25;
  white-space: pre-line;
}

.modExplicit {
  color: #8888ff;
  white-space: pre-line;
}

.modFractured {
  color: #c2aa6e;
  white-space: pre-line;
}

.modMutated {
  color: #e879c8;
  white-space: pre-line;
}

.modVeiled {
  color: #9fb6d1;
  font-style: italic;
  white-space: pre-line;
}

.modCrafted {
  color: #b8dcff;
  white-space: pre-line;
}

.modCrucible {
  color: #ff7b42;
  white-space: pre-line;
}

.modCorrupted {
  color: #e03c3c;
}

.modMirrored,
.modSplit,
.modTagInfo {
  color: #9bb8db;
}

.modTagSearing {
  color: #f08a5d;
  white-space: pre-line;
}

.modTagTangled {
  color: #7fb3ff;
  white-space: pre-line;
}

.descrText {
  color: #8f8f8f;
  font-style: italic;
  font-size: 0.8125rem;
  white-space: pre-line;
}

.listingFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-family: Exo2, sans-serif;
  font-size: 0.75rem;
  color: #9ca3af;
  padding-top: 0.1rem;
}

.listingPrice {
  color: #e4c29a;
  font-weight: 500;
}

.listingSeller {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #cbd5e0;
}

.listingAge {
  white-space: nowrap;
  color: #9ca3af;
}
</style>
