import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import localforage from 'localforage'

import type { Credential } from '@/poster'

export const useCredentialsStore = defineStore('credentials', () => {
  const credentials: Ref<Credential[]> = ref([])

  const lf = localforage.createInstance({ name: 'credentials' })

  lf.getItem('credentials')
    .then((value) => {
      if (value !== null) {
        credentials.value = JSON.parse(value as string)
      }
    })
    .catch((err) => {
      console.log(err)
      throw err
    })

  async function load() {
    if (credentials.value.length === 0) {
      const rawCredentials = await lf.getItem('credentials')
      if (rawCredentials !== null) {
        credentials.value = JSON.parse(rawCredentials as string)
      }
    }

    return credentials
  }

  const blueskyCredentials = computed(() => {
    return credentials.value.filter((cred) => cred.protocol == 'bluesky')
  })

  function clear(): void {
    credentials.value = []
  }

  function save(): void {
    lf.setItem('credentials', JSON.stringify(credentials.value)).catch((err) => {
      console.log(err)
      throw err
    })
  }

  async function register(credential: Credential): Promise<undefined> {
    if (!credential.server.startsWith('http')) {
      credential.server = `https://${credential.server}`
    }

    if (!URL.canParse(credential.server)) {
      throw new Error(`${credential.server} is not a valid url (did you include the "https://" ?)`)
    } else {
      const parsedUrl = new URL(credential.server)
      if (parsedUrl.protocol !== 'https:') {
        throw new Error(`${credential.server} is not an https server`)
      } else if (parsedUrl.hostname === '') {
        throw new Error(`${credential.server} does not include a hostname`)
      }
    }

    if (credential.username === '') {
      throw new Error('username is blank')
    }

    if (credential.secretKey === '') {
      throw new Error('password/secret key is blank')
    }

    if (
      credentials.value.some(
        (c) => c.server == credential.server && c.username == credential.username
      )
    ) {
      throw new Error("You've already added this user/server combination")
    }

    credentials.value.push(credential)
    save()

    return undefined
  }

  function remove(server: string, user: string): void {
    const updatedCreds = credentials.value.filter((cred) => {
      if (cred.server == server && cred.username == user) {
        return false
      }
      return true
    })

    credentials.value = updatedCreds
    save()
  }

  return { credentials, load, clear, save, remove, register, blueskyCredentials }
})
