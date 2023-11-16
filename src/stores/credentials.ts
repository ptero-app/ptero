import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

import type { Credential } from '@/poster'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials: Ref<Credential[]> = ref([])
  const displaySafeCreds = computed(() => {
    let out: Credential[] = []

    for (let i = 0; i < credentials.value.length; i++) {
      out[i] = credentials.value[i]
      out[i].secretKey = "<that's a secret>"
    }

    return out
  })

  function clear() {
    credentials.value = []
  }

  return { credentials, displaySafeCreds, clear }
})
