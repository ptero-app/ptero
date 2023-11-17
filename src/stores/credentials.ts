import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

import type { Credential } from '@/poster'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials: Ref<Credential[]> = ref([])

  const displaySafeCreds = computed(() => {
    const out: Credential[] = []

    for (const cred of credentials.value) {
      out.push({
        protocol: cred.protocol,
        server: cred.server,
        username: cred.username,
        secretKey: "<that's a secret>"
      })
    }

    return out
  })

  const blueskyCredentials = computed(() => {
    return credentials.value.filter((cred) => cred.protocol == "bluesky")
  })

  function clear() {
    credentials.value = []
  }

  return { credentials, displaySafeCreds, clear, blueskyCredentials }
})
