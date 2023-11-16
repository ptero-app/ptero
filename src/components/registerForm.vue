<script setup lang="ts">
  import { ref } from 'vue'
  import type { Ref } from 'vue'
  import { useCredentialsStore } from '@/stores/credentials'
  import type { Dialect } from '@/poster'

  const creds = useCredentialsStore()

  const protocol: Ref<Dialect|undefined> = ref(undefined)
  const server: Ref<string> = ref("")
  const username: Ref<string> = ref("")
  const secretKey: Ref<string> = ref("")

  function register() {
    if (protocol.value === undefined) {
      console.log("undefined protocol, can't register")
      throw new Error("undefined protocol, can't register")
    }

    creds.credentials.push({
      protocol: protocol.value,
      server: server.value,
      username: username.value,
      secretKey: secretKey.value,
    })
  }

  function clear() {
    creds.clear()
  }
</script>

<template>
  <h2>Register new connection</h2>

  <strong>Protocol</strong>
  <input type="radio" id="mastodon" value="mastodon" v-model="protocol">
  <label for="mastodon">Mastodon</label>
  <input type="radio" id="bluesky" value="bluesky" v-model="protocol">
  <label for="bluesky">Bluesky</label>
  <br />

  <label for="server">Server</label>
  <input type="text" v-model="server">
  <br />

  <label for="username">Username</label>
  <input type="text" v-model="username">
  <br />

  <label for="secretKey">API Key/App Password</label>
  <input type="text" v-model="secretKey">
  <br />

  <button @click="register">Register</button>
  <button @click="clear">Clear all connections</button>
</template>
