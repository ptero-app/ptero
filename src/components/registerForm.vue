<script setup lang="ts">
  import { ref } from 'vue'
  import type { Ref } from 'vue'
  import { useCredentialsStore } from '@/stores/credentials'

  import localforage from 'localforage'
  import type { StateTree } from 'pinia'

  import type { Dialect } from '@/poster'

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

  <h2>Saved Credentials</h2>
  <p>
    Credentials are only stored on your device, and not transmitted anywhere other than the servers you specify.
  </p>
  <pre><code>
{{creds.displaySafeCreds}}

{{creds.credentials}}
  </code></pre>
</template>
