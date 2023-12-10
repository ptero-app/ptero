<script setup lang="ts">
import { useCredentialsStore } from '@/stores/credentials'
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  console.log('mounted app')
  const creds = useCredentialsStore()
  await creds.load()

  if (creds.credentials.length == 0) {
    router.push({ path: '/credentials' })
  } else {
    router.push({ path: '/post' })
  }
})
</script>

<template>
  <header>
    <div class="container">
      <img src="/logo.svg" id="logo" alt="Ptero Logo" />
      <div class="desc">
        <h1>Ptero</h1>
        <p>The federated cross-poster for Mastodon and Bluesky</p>
      </div>
    </div>
  </header>

  <div id="tabs">
    <div class="container">
      <ul id="tab-select">
        <li :class="{ active: route.name == 'new-post' }">
          <router-link to="/post">Create Post</router-link>
        </li>
        <li :class="{ active: route.name == 'credentials' }">
          <router-link to="/credentials">Manage Credentials</router-link>
        </li>
        <li :class="{ active: route.name == 'bsky-delete' }">
          <router-link to="/bsky-delete">Mass Delete Posts</router-link>
        </li>
        <li :class="{ active: route.name == 'about' }">
          <router-link to="/">About</router-link>
        </li>
      </ul>

      <div id="tab-zone">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
