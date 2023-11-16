import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Credential } from '@/poster'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials: Credential[] = ref([])

  function clear() {
    credentials.value = []
  }

  return { credentials, clear }
})
