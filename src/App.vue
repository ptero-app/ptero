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
      creds.credentials = JSON.parse(value)
    }
  }).catch((err) => {console.log(err)})

  creds.$subscribe((_mut, state) => {
    lf.setItem("credentials", JSON.stringify(state.credentials)).catch((err) => {console.log(err)})
  }, {detached: true})
</script>

<template>
  <!--  <registerForm /> -->

  <postForm />

  <pre><code>
{{creds.credentials}}
  </code></pre>
</template>

<style scoped>
</style>
