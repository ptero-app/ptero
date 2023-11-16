import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

import type { Credential } from '@/poster'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials: Ref<Credential[]> = ref([])

  function clear() {
    credentials.value = []
  }

  return { credentials, clear }
})
