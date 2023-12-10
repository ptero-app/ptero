<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

import type { Dialect } from '@/poster'
import { useCredentialsStore } from '@/stores/credentials'

const creds = useCredentialsStore()

const protocol: Ref<Dialect | undefined> = ref(undefined)
const server: Ref<string> = ref('https://')
const username: Ref<string> = ref('')
const secretKey: Ref<string> = ref('')

const showPassword: Ref<boolean> = ref(false)

const passwordType = computed(() => {
  return showPassword.value ? 'text' : 'password'
})

const passwordButtonText = computed(() => {
  return showPassword.value ? 'Hide passwords' : 'Show passwords'
})

async function register() {
  if (protocol.value === undefined) {
    alert('Must pick a protocol!')
    return undefined
  }

  try {
    await creds.register({
      protocol: protocol.value,
      server: server.value,
      username: username.value,
      secretKey: secretKey.value
    })

    server.value = 'https://'
    protocol.value = undefined
    username.value = ''
    secretKey.value = ''
  } catch (err) {
    alert(`Error saving credential: ${err}`)
  }
}

function clear() {
  creds.clear()
}

function togglePasswords() {
  showPassword.value = !showPassword.value
}

function update() {
  creds.save()
}

function confirmRemove(server: string, username:string ) {
  const deleteIt = confirm(
    `Are you sure you wish to delete the credentials for ${username}@${server}?`
  )
  if (deleteIt) {
    creds.remove(server, username)
  }
}
</script>

<template>
  <section id="register">
    <h2>Register new connection</h2>

    <div class="input-grid">
      <label>Protocol</label>
      <div class="radio items">
        <input type="radio" id="mastodon" value="mastodon" v-model="protocol" />
        <label for="mastodon">Mastodon</label>
        <input type="radio" id="bluesky" value="bluesky" v-model="protocol" />
        <label for="bluesky">Bluesky</label>
      </div>

      <label for="server">Server</label>
      <input type="text" v-model="server" placeholder="must include https" />

      <label for="username">Username</label>
      <input type="text" v-model="username" />

      <label for="secretKey">API Key/App Password</label>
      <input type="text" v-model="secretKey" />
    </div>

    <button @click="register">Register</button>
    <button @click="clear">Clear all connections</button>
  </section>

  <section id="existing">
    <h2>Saved Credentials</h2>
    <p>
      Credentials are only stored on your device, and not transmitted anywhere other than the
      servers you specify.
    </p>

    <div id="saved-creds">
      <div class="saved-cred" v-for="cred in creds.credentials">
        <div class="input-grid">
          <label>Protocol</label> <span class="spacer">{{ cred.protocol }}</span>

          <label :for="cred.server + cred.username + 'server'">Server</label>
          <input type="text" :id="cred.server + cred.username + 'server'" v-model="cred.server" />

          <label :for="cred.server + cred.username + 'user'">Username</label>
          <input type="text" :id="cred.server + cred.username + 'user'" v-model="cred.username" />

          <label :for="cred.server + cred.username + 'secretKey'">Secret</label>
          <input
            :type="passwordType"
            :id="cred.server + cred.username + 'secretKey'"
            v-model="cred.secretKey"
          />

          <div class="full">
            <button @click="confirmRemove(cred.server, cred.username)">Remove</button>
          </div>
        </div>

        <hr />
      </div>
    </div>

    <button @click="togglePasswords">{{ passwordButtonText }}</button>
    <button @click="update">Update Credentials</button>
  </section>
</template>

<style scoped lang="scss">
hr {
  border-top: 3px solid black;
  margin-left: 10vw;
  margin-right: 10vw;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

section {
  margin-bottom: 2em;
  p {
    margin-bottom: 0.5em;
  }
}

#saved-creds {
  grid-template-columns: 50% 50%;
  display: grid;

  .saved-cred {
    .full {
      text-align: right;

      button:last-of-type {
        margin-right: 0;
      }
    }
  }
}
</style>
