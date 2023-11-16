<script setup lang="ts">
  import registerForm from './components/registerForm.vue'
  import postForm from './components/postForm.vue'
  import { useCredentialsStore } from '@/stores/credentials'
  import localforage from 'localforage'
  import type { StateTree } from 'pinia'

  const creds = useCredentialsStore()

  const lf = localforage.createInstance({name: "credentials"})
  lf.getItem("credentials").then((value) => {
    if (value !== null) {
      creds.credentials = JSON.parse(value as string)
    }
  }).catch((err) => {console.log(err)})

  creds.$subscribe((_mut, state) => {
    lf.setItem("credentials", JSON.stringify(state.credentials)).catch((err) => {console.log(err)})
  }, {detached: true})
</script>

<template>
  <h1>Ptero</h1>
  <p>
    Ptero is a federated cross-poster, for creating the same post with multiple accounts on services that speak the Mastodon and Bluesky protocols.

    Currently only supports posting to Bluesky
  </p>

  <registerForm />

  <postForm />

  <h2>Saved Credentials</h2>
  <p>
    Credentials are only stored on your device, and not transmitted anywhere other than the servers you specify.
  </p>
  <pre><code>
{{creds.credentials}}
  </code></pre>
</template>

<style scoped>
</style>
