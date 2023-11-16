import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

import type { Credential } from '@/poster'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials: Ref<Credential[]> = ref([])

  const displaySafeCreds = computed(() => {
    let out: Credential[] = []

    for (let cred of credentials.value) {
      out.push({
        protocol: cred.protocol,
        server: cred.server,
        username: cred.username,
        secretKey: "<that's a secret>"
      })
    }

    return out
  })

  function clear() {
    credentials.value = []
  }

  return { credentials, displaySafeCreds, clear }
})
