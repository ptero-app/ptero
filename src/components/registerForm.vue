<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { Ref } from 'vue'
  import localforage from 'localforage'

  import type { Dialect } from '@/poster'
  import { useCredentialsStore } from '@/stores/credentials'

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
  const server: Ref<string> = ref("https://")
  const username: Ref<string> = ref("")
  const secretKey: Ref<string> = ref("")

  const showPassword: Ref<boolean> = ref(false)

  const passwordType = computed(() => {
    return showPassword.value ? "text" : "password"
  })

  const passwordButtonText = computed(() => {
    return showPassword.value ? "Hide passwords" : "Show passwords"
  })

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

    server.value = "https://"
    protocol.value = undefined
    username.value = ""
    secretKey.value = ""
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
</script>

<template>
  <h2>Register new connection</h2>

  <div class="grid">
    <label>Protocol</label>
    <div class="radio items">
      <input type="radio" id="mastodon" value="mastodon" v-model="protocol">
      <label for="mastodon">Mastodon</label>
      <input type="radio" id="bluesky" value="bluesky" v-model="protocol">
      <label for="bluesky">Bluesky</label>
    </div>

    <label for="server">Server</label>
    <input type="text" v-model="server" placeholder="must include https" >

    <label for="username">Username</label>
    <input type="text" v-model="username">

    <label for="secretKey">API Key/App Password</label>
    <input type="text" v-model="secretKey">
  </div>

  <button @click="register">Register</button>
  <button @click="clear">Clear all connections</button>

  <h2>Saved Credentials</h2>
  <p>
    Credentials are only stored on your device, and not transmitted anywhere other than the servers you specify.
  </p>

  <div id="saved-creds" v-for="cred in creds.credentials">
    <div class="grid">
      <label>Protocol</label> <span class="spacer">{{cred.protocol}}</span>

      <label :for="cred.server + cred.username + 'server'">Server</label>
      <input type="text" :id="cred.server + cred.username + 'server'" v-model="cred.server" />


      <label :for="cred.server + cred.username + 'user'">Username</label>
      <input type="text" :id="cred.server + cred.username + 'user'" v-model="cred.username" />

      <label :for="cred.server + cred.username + 'secretKey'">Secret</label>
      <input :type="passwordType" :id="cred.server + cred.username + 'secretKey'" v-model="cred.secretKey" />
    </div>

    <hr>
  </div>

  <button @click="togglePasswords">{{passwordButtonText}}</button>
  <button @click="update">Update Credentials</button>
</template>

<style scoped lang="scss">
  .grid {
    display: grid;
    grid-template-columns: 10em auto;

    label {
      padding-right: 1em;
      padding-top: 0.25em;
      text-align: right;
      font-weight: bold;
    }

    .spacer {
      padding-top: 0.25em;
      padding-bottom: 0.5em;
    }

    input {
      margin-bottom: 0.5em;
    }
  }

  hr {
    border-top: 3px solid black;
    margin-left: 10vw;
    margin-right: 10vw;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
</style>
