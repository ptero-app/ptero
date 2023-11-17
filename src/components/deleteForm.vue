<script setup lang="ts">
  import { ref } from 'vue'
  import type { Ref } from 'vue'

  import { useCredentialsStore } from '@/stores/credentials'
  import { Deleter, type Credential } from '@/poster'

  const creds = useCredentialsStore()
  const statusMessage: Ref<string> = ref("")

  const selectedCreds: Ref<string> = ref("")
  const numDays: Ref<number> = ref(14)

  function deletePosts() {
    statusMessage.value = "Starting Post Delete Process..."

    const filteredCreds: Credential[] = creds.credentials.filter((cred) => cred.username == selectedCreds.value) as Credential[]
    if (!filteredCreds.length) {
      statusMessage.value = "No credentials selected"
      return
    }

    const cred: Credential = filteredCreds.pop() as Credential

    statusMessage.value = "Collecting posts..."
    const deleter = new Deleter(cred)
    deleter.postsToDelete(numDays.value).then((posts) => {
      const deleteThem = confirm(`You are about to delete ${posts.length} posts. This is irreversable. Do you wish to continue?`)

      if (deleteThem) {
        statusMessage.value = "Deleting posts..."
        deleter.deletePosts(numDays.value).then((wereDeleted) => {
          if (wereDeleted) {
            statusMessage.value = `Deleted ${posts.length} posts`
          } else {
            statusMessage.value = "Call to delete posts did not error, but did not succeed either??? idk try again???"
          }
        }).catch((e) => {
          statusMessage.value = `Error deleting:\n${e}`
        })
      } else {
        statusMessage.value = "Canceled delete"
      }
    }).catch((e) => {
      statusMessage.value = `Error collecting posts:\n${e}`
    })
  }

  function deleteReposts() {
    statusMessage.value = "Starting Repost Delete Process..."

    const filteredCreds: Credential[] = creds.credentials.filter((cred) => cred.username == selectedCreds.value) as Credential[]
    if (!filteredCreds.length) {
      statusMessage.value = "No credentials selected"
      return
    }

    const cred: Credential = filteredCreds.pop() as Credential

    statusMessage.value = "Collecting reposts..."
    const deleter = new Deleter(cred)
    deleter.repostsToDelete(numDays.value).then((reposts) => {
      const deleteThem = confirm(`You are about to delete ${reposts.length} reposts. This is irreversable. Do you wish to continue?`)

      if (deleteThem) {
        statusMessage.value = "Deleting Reposts..."
        deleter.deleteReposts(numDays.value).then((wereDeleted) => {
          if (wereDeleted) {
            statusMessage.value = `Deleted ${reposts.length} reposts`
          } else {
            statusMessage.value = "Call to delete reposts did not error, but did not succeed either??? idk try again???"
          }
        }).catch((e) => {
          statusMessage.value = `Error deleting:\n${e}`
        })
      } else {
        statusMessage.value = "Canceled delete"
      }
    }).catch((e) => {
      statusMessage.value = `Error collecting reposts:\n${e}`
    })
  }
</script>

<template>
  <h2>Delete Bluesky Posts</h2>

  <p><strong>This is irreversible, make sure you want to do this!</strong></p>

  <strong>Credentials to use:</strong><br />
  <span v-for="cred in creds.blueskyCredentials">
    <input type="radio" :id="cred.username" v-model="selectedCreds" :value="cred.username">&nbsp;
    <label :for="cred.username">{{cred.username}}</label>&nbsp;
  </span>
  <br />

  <label for="numDays"><strong>Number of days to keep:</strong></label><br />
  <input type="number" id="numDays" v-model="numDays" /><br />

  <button @click="deletePosts">Delete Posts</button>
  <button @click="deleteReposts">Delete Reposts</button>

  <pre><code>
{{statusMessage}}
  </code></pre>
</template>
