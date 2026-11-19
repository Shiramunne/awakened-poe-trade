<template>
  <div v-if="sockets.length > 0" :class="$style.row">
    <div :class="sockets.length === 1 ? $style.single : $style.grid">
      <template v-if="sockets.length === 1">
        <span :class="[$style.socket, $style[`color_${sockets[0].color}`]]">
          <svg v-if="sockets[0].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
            <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
          </svg>
          <span v-else :class="$style.socketCore" />
        </span>
      </template>

      <template v-else>
        <!-- Row 1: [0] - [1] -->
        <span :class="[$style.socket, $style[`color_${sockets[0].color}`]]">
          <svg v-if="sockets[0].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
            <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
          </svg>
          <span v-else :class="$style.socketCore" />
        </span>
        <span :class="isLinked(0, 1) ? $style.linkH : $style.spacerH" />
        <span :class="[$style.socket, $style[`color_${sockets[1].color}`]]">
          <svg v-if="sockets[1].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
            <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
          </svg>
          <span v-else :class="$style.socketCore" />
        </span>

        <!-- Row 1 -> 2 bridge: right vertical 1-2 -->
        <template v-if="sockets.length >= 3">
          <span />
          <span />
          <span :class="isLinked(1, 2) ? $style.linkV : $style.spacerV" />

          <!-- Row 2: [3] - [2] -->
          <span v-if="sockets.length >= 4" :class="[$style.socket, $style[`color_${sockets[3].color}`]]">
            <svg v-if="sockets[3].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
              <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
            </svg>
            <span v-else :class="$style.socketCore" />
          </span>
          <span v-else />
          <span :class="sockets.length >= 4 && isLinked(2, 3) ? $style.linkH : $style.spacerH" />
          <span :class="[$style.socket, $style[`color_${sockets[2].color}`]]">
            <svg v-if="sockets[2].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
              <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
            </svg>
            <span v-else :class="$style.socketCore" />
          </span>
        </template>

        <!-- Row 2 -> 3 bridge: left vertical 3-4 -->
        <template v-if="sockets.length >= 5">
          <span :class="isLinked(3, 4) ? $style.linkV : $style.spacerV" />
          <span />
          <span />

          <!-- Row 3: [4] - [5] -->
          <span :class="[$style.socket, $style[`color_${sockets[4].color}`]]">
            <svg v-if="sockets[4].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
              <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
            </svg>
            <span v-else :class="$style.socketCore" />
          </span>
          <span :class="sockets.length >= 6 && isLinked(4, 5) ? $style.linkH : $style.spacerH" />
          <span v-if="sockets.length >= 6" :class="[$style.socket, $style[`color_${sockets[5].color}`]]">
            <svg v-if="sockets[5].color === 'A'" viewBox="0 0 12 12" :class="$style.abyssalGem" aria-hidden="true">
              <polygon points="6,1.5 10.5,6 6,10.5 1.5,6" fill="#0d0e12" stroke="#535c73" stroke-width="1.4" />
            </svg>
            <span v-else :class="$style.socketCore" />
          </span>
          <span v-else />
        </template>
      </template>
    </div>

    <span v-if="badgeText" :class="$style.badge">{{ badgeText }}</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import type { HoverItemSocket } from './types'

export default defineComponent({
  name: 'TradeHoverSockets',
  props: {
    sockets: {
      type: Array as PropType<HoverItemSocket[]>,
      required: true
    },
    maxLinks: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const badgeText = computed(() => {
      if (props.maxLinks >= 5) {
        return `${props.maxLinks}L`
      }
      if (props.sockets.length === 6) {
        return '6S'
      }
      return null
    })

    function isLinked (a: number, b: number): boolean {
      const sa = props.sockets[a]
      const sb = props.sockets[b]
      return sa != null && sb != null && sa.group === sb.group
    }

    return {
      badgeText,
      isLinked
    }
  }
})
</script>

<style lang="postcss" module>
.row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.25rem 0;
}

.single {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: 1.05rem 0.55rem 1.05rem;
  justify-items: center;
  align-items: center;
}

.socket {
  position: relative;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.24), rgba(0, 0, 0, 0.78));
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.85);
  z-index: 2;
}

.socketCore {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 9999px;
  background: rgba(8, 10, 14, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.abyssalGem {
  width: 0.72rem;
  height: 0.72rem;
}

.color_R {
  border-color: #d13434;
  background-color: #5b1414;
}

.color_G {
  border-color: #3ba83b;
  background-color: #144718;
}

.color_B {
  border-color: #3d74e0;
  background-color: #142a59;
}

.color_W {
  border-color: #e6e6e6;
  background-color: #6b7280;
}

.color_A {
  border-color: #69748c;
  background-color: #1c2029;
  border-radius: 0.2rem;
}

.color_DV {
  border-color: #c99c4a;
  background-color: #4a3514;
}

.linkH {
  display: block;
  width: 0.7rem;
  height: 0.24rem;
  margin: 0 -2px;
  background: linear-gradient(to bottom, #f0d797, #b3893b, #6f521f);
  border-top: 1px solid #3c2a0d;
  border-bottom: 1px solid #2b1d07;
  z-index: 1;
}

.linkV {
  display: block;
  width: 0.24rem;
  height: 0.55rem;
  margin: -2px 0;
  background: linear-gradient(to right, #f0d797, #b3893b, #6f521f);
  border-left: 1px solid #3c2a0d;
  border-right: 1px solid #2b1d07;
  z-index: 1;
}

.spacerH {
  display: block;
  width: 0.55rem;
  height: 0.24rem;
}

.spacerV {
  display: block;
  width: 0.24rem;
  height: 0.35rem;
}

.badge {
  font-size: 0.72rem;
  line-height: 1;
  padding: 0.16rem 0.35rem;
  border-radius: 0.22rem;
  color: #e2c58a;
  background: rgba(201, 166, 91, 0.14);
  border: 1px solid rgba(201, 166, 91, 0.35);
}
</style>
