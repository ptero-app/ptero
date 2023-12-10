<script setup lang="ts">
import { ref, watch, toRaw, onMounted } from 'vue'
import type { Ref } from 'vue'
import Compressor from 'compressorjs'
import { useCredentialsStore } from '@/stores/credentials'
import { Poster, MaxImageSize } from '@/poster'
import type { Post } from '@/poster'

type toastType = 'posted' | 'error'
type toast = {
  type: toastType
  link?: string
  shortname?: string
  error?: string
}

const emptyPost: Post = {
  text: '',
  contentWarning: '',
  sensitivity: 'none',
  images: []
}

const posts: Ref<Post[]> = ref([structuredClone(emptyPost)])

const toasts: Ref<toast[]> = ref([])
const creds = useCredentialsStore()

onMounted(() => {
  const queryParams = new URLSearchParams(window.location.search)
  if (queryParams.has('text')) {
    posts.value[0].text = queryParams.get('text') as string
  }
})

const disableUpload: Ref<boolean> = ref(false)

const enqueued: Ref<number> = ref(0)
watch(enqueued, (value, lastValue) => {
  if (value == 0 && lastValue != 0) {
    posts.value = [{ ...emptyPost }]
  }
})

function post() {
  toasts.value = []

  for (const post of posts.value) {
    if (post.text.length + post.images?.length == 0) {
      toasts.value.push({
        type: 'error',
        error: "Can't send an empty post"
      })
      return
    }

    if (post.text.length > 300) {
      toasts.value.push({
        type: 'error',
        error: 'One of your posts is too long'
      })
      return
    }
  }

  enqueued.value += creds.credentials.length

  for (let cred of creds.credentials) {
    const poster = new Poster(cred)
    poster
      .postMany(toRaw(posts.value))
      .then((resp) => {
        console.log('success', resp)
        toasts.value.push({
          type: 'posted',
          link: resp.url,
          shortname: `${cred.server} : ${cred.username}`
        })
      })
      .catch((e) => {
        console.log('error', e, typeof e)
        toasts.value.push({
          type: 'error',
          error: `Couldn't post to ${cred.server}: ${e}`
        })
        console.log('failed to post', e)
      })
      .finally(() => {
        enqueued.value--
      })
  }
}

function imageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const index = parseInt(input.getAttribute('data-index') as string)

  const post = posts.value[index]
  console.log(post)
  console.log('if')

  if (post.images.length >= 4) {
    const deleteEm = confirm(
      'You have already uploaded four images. Clear them all and start over?'
    )
    if (!deleteEm) {
      return
    }

    post.images = []
  }

  if (input.files) {
    const file = input.files[0]

    compressImage(file, MaxImageSize)
      .then((file) => {
        post.images.push({
          image: file as File,
          description: '',
          blobUrl: URL.createObjectURL(file)
        })
      })
      .catch((error) => {
        console.log("Couldn't compress file:", error)
        alert(`Couldn't compress file to less than 1MB, try manually resizing`)
      })
  }
}

const compressLevels = [
  { quality: 0.8, resize: false },
  { quality: 0.8, resize: true },
  { quality: 0.6, resize: true }
]
async function compressImage(image: File, maxSize: number): Promise<File | Blob> {
  if (image.size < maxSize) {
    return image
  }

  for (const compressLevel of compressLevels) {
    const compressed = await new Promise<File | Blob>((resolve, reject) => {
      let options: Compressor.Options = {
        quality: compressLevel.quality,
        resize: compressLevel.resize ? 'contain' : 'none',
        success: resolve,
        error: reject
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
  if (event.key == 'Enter' && (event.metaKey || event.ctrlKey)) {
    post()
  }
}

function addReply() {
  const newPost = structuredClone(emptyPost)
  newPost.contentWarning = posts.value[posts.value.length - 1].contentWarning

  posts.value.push(newPost)
}
</script>

<template>
  <div class="toasts">
    <div v-for="toast in toasts">
      <div :class="toast.type" class="toast">
        <span v-if="toast.type == 'posted'">
          Posted to <a :href="toast.link">{{ toast.shortname }}</a>
        </span>
        <span v-if="toast.type == 'error'">
          {{ toast.error }}
        </span>
      </div>
    </div>
  </div>

  <form @submit.prevent="post">
    <div class="post" v-for="(post, index) in posts">
      <input
        type="text"
        name="cw"
        placeholder="optional content warning"
        v-model="post.contentWarning"
      />

      <div class="postText">
        <textarea
          name="text"
          placeholder="What's happening?"
          v-model="post.text"
          @keydown="checkIfFastPost"
        ></textarea>
        <div class="postLength">{{ post.text.length }} / 300</div>
      </div>

      <div class="fakie">
        <label class="btn">
          Upload Image
          <input
            type="file"
            accept="image/*"
            @change="imageChange"
            :data-index="index"
            :disabled="disableUpload"
            style="display: none"
          />
        </label>
      </div>

      <div v-show="post.images.length != 0">
        <div class="image-grid">
          <div v-for="image in post.images" class="image-container">
            <img :src="image.blobUrl" />
            <label :for="image.blobUrl">Alt Text</label>
            <textarea :id="image.blobUrl" v-model="image.description"></textarea>
          </div>
        </div>

        <div id="sensitivity-picker">
          <strong>Sensitivity</strong><br />
          <input type="radio" id="none" value="none" v-model="post.sensitivity" />&nbsp;
          <label for="none">None</label>&nbsp;
          <input type="radio" id="sexual" value="sexual" v-model="post.sensitivity" />&nbsp;
          <label for="sexual">Suggestive</label>&nbsp;
          <input type="radio" id="nudity" value="nudity" v-model="post.sensitivity" />&nbsp;
          <label for="nudity">Nudity</label>&nbsp;
          <input type="radio" id="porn" value="porn" v-model="post.sensitivity" />&nbsp;
          <label for="porn">Porn</label>&nbsp;
        </div>
      </div>
    </div>

    <button id="postit" :disabled="enqueued != 0">Post</button>
    <button id="addreply" :disabled="enqueued != 0" @click.prevent="addReply">Add to thread</button>
  </form>
</template>

<style scoped lang="scss">
.image-grid {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  margin-top: 2em;

  @media (max-width: 650px) {
    grid-template-columns: 50% 50%;
  }

  @media (max-width: 400px) {
    grid-template-columns: 100%;
  }

  .image-container {
    margin-bottom: 1em;

    img {
      max-width: 100%;
    }

    label {
      width: 100%;
      display: block;
      font-weight: bold;
    }
    textarea {
      width: 100%;
    }
  }
}

.post {
  input[type='text'] {
    width: 100%;
  }
}

#sensitivity-picker {
  margin-bottom: 1em;
}

#postit {
  @media (max-width: 650px) {
    width: 100%;
    text-align: left;
  }
}

@media (max-width: 650px) {
  #imglabel {
    display: none;
  }
}

.postText {
  textarea {
    width: 100%;
    padding-bottom: 2em;

    @media (max-width: 650px) {
      min-height: 8em;
    }
  }

  .postLength {
    position: relative;
    float: right;
    bottom: 2.5em;
    text-align: right;
    padding-right: 0.5em;
    font-family: monospace;
    font-weight: bold;
    color: rgb(175, 175, 175);
  }
}

.post {
  margin-bottom: 2em;
}

#addReply {
  float: right;
}
</style>
