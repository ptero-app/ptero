<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { Ref } from 'vue'
  import Compressor from 'compressorjs'
  import { useCredentialsStore } from '@/stores/credentials'
  import { Poster, MaxImageSize } from '@/poster'
  import type { Post, Sensitivity } from '@/poster'

  type toastType = "posted" | "error"
  type toast = {
    type: toastType
    link?: string
    error?: string
  }

  type Image = {
    image: File
    description: string
    blobUrl: string
  }

  const toasts: Ref<toast[]> = ref([])

  const creds = useCredentialsStore()

  const contentWarning: Ref<string> = ref("")
  const text: Ref<string> = ref("")
  const images: Ref<Image[]> = ref([])
  const sensitivity: Ref<Sensitivity> = ref("none")

  window.onload = () => {
    const queryParams = new URLSearchParams(window.location.search)
    if (queryParams.has("text")) {
      text.value = queryParams.get("text") as string
    }
  }

  const disableUpload: Ref<boolean> = ref(false)

  const enqueued: Ref<number> = ref(0)
  watch(enqueued, (value, lastValue) => {
    if (value == 0 && lastValue != 0) {
      contentWarning.value = ""
      text.value = ""
      images.value = []
      sensitivity.value = "none"
    }
  })

  function post() {
    toasts.value = []

    if (text.value.length > 300) {
      const over = text.value.length - 300
      alert(`your post text is too long, it is currently ${over} characters too long`)
      return
    }

    enqueued.value += creds.credentials.length

    let post: Post = {
      text: text.value,
      sensitivity: sensitivity.value,
      contentWarning: contentWarning.value,
    }

    if (images.value.length) {
      post.images = images.value
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
    if (images.value.length >= 4) {
      const deleteEm = confirm("You have already uploaded four images. Clear them all and start over?")
      if (!deleteEm) {
        return
      }

      images.value = []
    }

    const input = event.target as HTMLInputElement
    if (input.files) {
      const file = input.files[0]

      compressImage(file, MaxImageSize).then((file) => {
        images.value.push({
          image: file as File,
          description: "",
          blobUrl: URL.createObjectURL(file),
        })
      }).catch((error) => {
        console.log("Couldn't compress file:", error)
        alert(`Couldn't compress file to less than 1MB, try manually resizing`)
      })
    }
  }

  const compressLevels = [
    {quality: 0.8, resize: false},
    {quality: 0.8, resize: true},
    {quality: 0.6, resize: true},
  ]
  async function compressImage(image: File, maxSize: number): Promise<File|Blob> {
    if (image.size < maxSize) {
      return image
    }

    for (const compressLevel of compressLevels) {
      const compressed = await new Promise<File|Blo|Blobb>((resolve, reject) => {
        let options: Compressor.Options = {
          quality: compressLevel.quality,
          resize: compressLevel.resize ? "contain" : "none",
          success: resolve,
          error: reject,
        }

        if (compressLevel.resize) {
          options.maxHeight = 1200
          options.maxWidth = 1200
        }

        new Compressor(image, options)
      })

      if (compressed.size < maxSize) {
        return compressed
      }
    }

    throw new Error("Couldn't automatically compress image")
  }

  function checkIfFastPost(event: KeyboardEvent) {
    if (event.key == "Enter" && (event.metaKey || event.ctrlKey)) {
      post()
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

  <form @submit.prevent="post">
    <div class="input-grid">
      <label for="cw">Content warning</label>
      <input type="text" name="cw" v-model="contentWarning">

      <label for="text">Post text</label>
      <textarea name="text" v-model="text" @keydown="checkIfFastPost"></textarea>

      <label for="image">Image</label>
      <div class="fakie">
        <label class="btn">
          Choose Image
          <input type="file" accept="image/*" @change="imageChange" :disabled="disableUpload" style="display: none;">
        </label>
      </div>
    </div>

    <div v-show="images.length != 0">
      <div class="image-grid">
        <div v-for="image in images" class="image-container">
          <img :src="image.blobUrl" />
          <label :for="image.blobUrl">Alt Text</label>
          <textarea :id="image.blobUrl" v-model="image.description"></textarea>
        </div>
      </div>

      <strong>Sensitivity</strong><br />
      <input type="radio" id="none" value="none" v-model="sensitivity">&nbsp;
      <label for="none">None</label>&nbsp;
      <input type="radio" id="sexual" value="sexual" v-model="sensitivity">&nbsp;
      <label for="sexual">Suggestive</label>&nbsp;
      <input type="radio" id="nudity" value="nudity" v-model="sensitivity">&nbsp;
      <label for="nudity">Nudity</label>&nbsp;
      <input type="radio" id="porn" value="porn" v-model="sensitivity">&nbsp;
      <label for="porn">Porn</label>&nbsp;
    </div>

    <button :disabled="enqueued != 0">Post</button>
  </form>
</template>

<style scoped lang="scss">
  .image-grid {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    margin-top: 1em;

    .image-container {
      img {
        max-width: 100%;
      }

      label { width: 100%; display: block; font-weight: bold; }
      textarea { width: 100% }
    }
  }

</style>
