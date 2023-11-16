<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { Ref } from 'vue'
  import { useCredentialsStore } from '@/stores/credentials'
  import { Poster } from '@/poster'
  import type { Post, Sensitivity } from '@/poster'

  type toastType = "posted" | "error"
  type toast = {
    type: toastType
    link?: string
    error?: string
  }

  const toasts: Ref<toast[]> = ref([])

  const creds = useCredentialsStore()

  const enqueued: Ref<number> = ref(0)

  const contentWarning: Ref<string> = ref("")
  const text: Ref<string> = ref("")
  const image: Ref<File|undefined> = ref(undefined)
  const altText: Ref<string> = ref("")
  const sensitivity: Ref<Sensitivity> = ref("none")

  const imageUrl = computed(() => {
    if (!(image.value instanceof File)) {
      return ""
    }

    return URL.createObjectURL(image.value)
  })

  const displayAltText = computed(() => {
    if (!(image.value instanceof File)) {
      return "none"
    }
    return "block"
  })

  function post() {
    enqueued.value += creds.credentials.length

    let post: Post = {
      text: text.value,
      sensitivity: sensitivity.value,
      contentWarning: contentWarning.value,
    }

    if (image.value !== undefined) {
      post.images = [{image: image.value, description: altText.value}]
    }

    for (let cred of creds.credentials) {
      const poster = new Poster(cred)
      poster.post(post).then((url) => {
        console.log("success", url)
        toasts.value.push({
          type: "posted",
          link: url,
        })
      }).catch((e) => {
        console.log("error", e, typeof e)
        toasts.value.push({
          type: "error",
          error: `Couldn't post to ${cred.server}: ${e}`,
        })
        console.log("failed to post", e)
      }).finally(() => {
        enqueued.value--
      })
    }
  }

  function imageChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files) {
      const file = input.files[0]
      image.value = file
    }
  }
</script>

<template>
  <div class="toasts">
    <div v-for="toast in toasts">
      <div :class="toast.type" class="toast">
        <span v-if="toast.type == 'posted'">
          Posted to <a :href="toast.link">{{toast.link}}</a>
        </span>
        <span v-if="toast.type == 'error'">
          {{toast.error}}
        </span>
      </div>
    </div>
  </div>

  <h2>Create post</h2>

  <label for="cw">Content warning</label><br />
  <input type="text" name="cw" v-model="contentWarning"><br />

  <label for="text">Post text</label><br />
  <textarea name="text" v-model="text"></textarea><br />

  <label for="image">Image</label><br>
  <input type="file" accept="image/*" @change="imageChange"><br />

  <img :src="imageUrl" style="max-height: 200px;"/><br/>

  <div :style="{display: displayAltText}">
    <label for="altText">Alt Text</label><br />
    <input type="text" name="altText" v-model="altText"><br />

    <strong>Sensitivity</strong><br />
    <input type="radio" id="none" value="none" v-model="sensitivity">
    <label for="none">None</label>
    <input type="radio" id="sexual" value="sexual" v-model="sensitivity">
    <label for="sexual">Suggestive</label>
    <input type="radio" id="nudity" value="nudity" v-model="sensitivity">
    <label for="nudity">Nudity</label>
    <input type="radio" id="porn" value="porn" v-model="sensitivity">
    <label for="porn">Porn</label>
  </div>

  <button @click="post" :disabled="enqueued != 0">Post</button>
</template>
