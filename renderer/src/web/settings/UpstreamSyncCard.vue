<template>
  <div class="border border-gray-600 rounded p-3 w-80 space-y-2 text-xs">
    <div class="flex items-center justify-between gap-2">
      <span class="font-semibold text-gray-200">Projeto Original (SnosMe)</span>
      <span
        v-if="statusBadge"
        class="px-1.5 py-0.5 rounded font-sans"
        :class="statusBadge.cls"
      >{{ statusBadge.text }}</span>
    </div>

    <div class="text-gray-400 space-y-0.5">
      <div v-if="state.status === 'idle'">
        Clique abaixo para verificar se o repositório original recebeu novidades.
      </div>
      <div v-else-if="state.status === 'loading'">
        Consultando GitHub (SnosMe)...
      </div>
      <div v-else-if="state.status === 'error'" class="text-red-400">
        {{ state.message }}
      </div>
      <template v-else-if="state.status === 'ready'">
        <div>
          Última versão oficial: <strong class="text-gray-200">{{ state.latestTag }}</strong>
          <span v-if="state.publishedRelative" class="text-gray-500"> ({{ state.publishedRelative }})</span>
        </div>
        <div v-if="state.aheadBy > 0" class="text-orange-300">
          Há {{ state.aheadBy }} commit(s) novo(s) no original aguardando sync.
        </div>
        <div v-else class="text-green-400">
          Seu fork está sincronizado com o código original.
        </div>
      </template>
    </div>

    <div class="flex flex-col gap-1.5 pt-1">
      <button
        type="button"
        class="btn w-full py-1"
        :disabled="state.status === 'loading'"
        @click="checkUpstream(true)"
      >
        {{ state.status === 'loading' ? 'Verificando...' : 'Verificar original' }}
      </button>
      <div class="flex gap-1.5">
        <button
          type="button"
          class="btn flex-1 py-1"
          @click="openUrl(FORK_HOME_URL)"
        >
          Abrir Fork (Sync)
        </button>
        <button
          type="button"
          class="btn flex-1 py-1"
          @click="openUrl(COMPARE_URL)"
        >
          Ver mudanças
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, shallowRef } from 'vue'
import { DateTime } from 'luxon'

const FORK_HOME_URL = 'https://github.com/Shiramunne/awakened-poe-trade'
const COMPARE_URL = 'https://github.com/Shiramunne/awakened-poe-trade/compare/master...SnosMe:awakened-poe-trade:master'
const API_RELEASE_URL = 'https://api.github.com/repos/SnosMe/awakened-poe-trade/releases/latest'
const API_COMPARE_URL = 'https://api.github.com/repos/Shiramunne/awakened-poe-trade/compare/master...SnosMe:awakened-poe-trade:master'

type UpstreamState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error', message: string }
  | { status: 'ready', latestTag: string, publishedRelative: string, aheadBy: number }

let cachedState: UpstreamState | null = null
let cachedAt = 0
const CACHE_TTL_MS = 5 * 60 * 1000

export default defineComponent({
  name: 'UpstreamSyncCard',
  setup () {
    const state = shallowRef<UpstreamState>(cachedState ?? { status: 'idle' })

    async function checkUpstream (force = false) {
      if (!force && cachedState && (Date.now() - cachedAt) < CACHE_TTL_MS) {
        state.value = cachedState
        return
      }

      state.value = { status: 'loading' }
      try {
        const [relRes, cmpRes] = await Promise.all([
          fetch(API_RELEASE_URL, { headers: { Accept: 'application/vnd.github+json' } }),
          fetch(API_COMPARE_URL, { headers: { Accept: 'application/vnd.github+json' } })
        ])

        if (!relRes.ok || !cmpRes.ok) {
          throw new Error(`GitHub API HTTP ${!relRes.ok ? relRes.status : cmpRes.status}`)
        }

        const relJson = await relRes.json() as { tag_name?: string, published_at?: string }
        const cmpJson = await cmpRes.json() as { ahead_by?: number }

        const publishedRelative = relJson.published_at
          ? (DateTime.fromISO(relJson.published_at).toRelative({ style: 'short' }) ?? '')
          : ''

        const next: UpstreamState = {
          status: 'ready',
          latestTag: relJson.tag_name ?? 'desconhecida',
          publishedRelative,
          aheadBy: typeof cmpJson.ahead_by === 'number' ? cmpJson.ahead_by : 0
        }

        cachedState = next
        cachedAt = Date.now()
        state.value = next
      } catch (err) {
        state.value = {
          status: 'error',
          message: `Falha ao consultar GitHub: ${(err as Error).message}`
        }
      }
    }

    const statusBadge = computed(() => {
      if (state.value.status !== 'ready') return null
      if (state.value.aheadBy > 0) {
        return { text: `${state.value.aheadBy} novo(s)`, cls: 'bg-orange-700 text-orange-100' }
      }
      return { text: 'Em dia', cls: 'bg-green-800 text-green-100' }
    })

    function openUrl (url: string) {
      window.open(url)
    }

    onMounted(() => {
      if (state.value.status === 'idle') {
        checkUpstream(false)
      }
    })

    return {
      FORK_HOME_URL,
      COMPARE_URL,
      state,
      statusBadge,
      checkUpstream,
      openUrl
    }
  }
})
</script>
