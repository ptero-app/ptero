<script setup lang="ts">
  import { ref } from 'vue'
  import { useCredentialsStore } from '@/stores/credentials'

  const creds = useCredentialsStore()

  const protocol = ref("")
  const server = ref("")
  const username = ref("")
  const secretKey = ref("")

  function register() {
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
