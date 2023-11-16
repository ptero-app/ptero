<script setup lang="ts">
  import registerForm from './components/registerForm.vue'
  import postForm from './components/postForm.vue'
  import { useCredentialsStore } from '@/stores/credentials'

  import { ref, computed } from 'vue'
  import type { Ref } from 'vue'

  const creds = useCredentialsStore()

  const tab: Ref<string> = ref("post")

  const showPost = computed(() => {
    return tab.value == "post"
  })
  const showCredentials = computed(() => {
    return tab.value == "credentials"
  })

  function openPost() {
    tab.value = "post"
    console.log(tab.value)
  }

  function openCredentials() {
    tab.value = "credentials"
    console.log(tab.value)
  }
</script>

<template>
  <header>
    <h1>Ptero</h1>

    <p>
      Ptero is a federated cross-poster, for creating the same post with multiple accounts on services that speak the Mastodon and Bluesky protocols.
    </p>
  </header>

  <div id="tabs">
    <ul id="tab-select">
      <li :class="{active: showPost}"><a @click="openPost" href="#">Create Post</a></li>
      <li :class="{active: showCredentials}"><a @click="openCredentials" href="#">Manage Credentials</a></li>
    </ul>

    <div id="tab-zone">
      <div class="tab" v-show="showCredentials">
        <registerForm />
      </div>
      <div class="tab" v-show="showPost" >
        <postForm />
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
  $line-size: 5px;

  header {
    margin-bottom: 2em;

    h1 {
      text-align: center;
    }
  }

  #tabs {
    #tab-select {
      display: flex;
      //justify-content: center;

      list-style: none;
      margin: 0;
      padding: 0;
      border-bottom: $line-size solid black;
      padding-left: 1em;

      li {
        padding: 0.5em 1em;
        //margin-left: 0.5em;
        margin-right: 1em;
        border: $line-size solid black;
        //border-radius: 5px 5px 0 0;
        border-bottom-width: 0px;
        background: rgb(200, 200, 200);

        &.active {
          background: white;
          border-bottom: $line-size solid white;
          margin-bottom: -5px;
        }

        a {
          color: black;
          text-decoration: none;
        }
      }
    }
  }
</style>
