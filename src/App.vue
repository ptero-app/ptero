<script setup lang="ts">
  import registerForm from './components/registerForm.vue'
  import postForm from './components/postForm.vue'

  import { ref, computed } from 'vue'
  import type { Ref } from 'vue'

  const tab: Ref<string> = ref("post")

  const showPost = computed(() => {
    return tab.value == "post"
  })
  const showCredentials = computed(() => {
    return tab.value == "credentials"
  })
  const showAbout = computed(() => {
    return tab.value == "about"
  })

  function openPost() {
    tab.value = "post"
  }

  function openCredentials() {
    tab.value = "credentials"
  }

  function openAbout() {
    tab.value = "about"
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
      <li :class="{active: showAbout}"><a @click="openAbout" href="#">About</a></li>
    </ul>

    <div id="tab-zone">
      <div class="tab" v-show="showCredentials">
        <registerForm />
      </div>
      <div class="tab" v-show="showPost">
        <postForm />
      </div>

      <div class="tab" v-show="showAbout">
        <h2>About Ptero</h2>

        <p>
          Ptero is an app for posting to both Mastodon and Bluesky at the same time (and supports posting to multiple accounts for each service).
        </p>

        <p>
          Ptero runs completely in your web browser, meaning your credentials stay completely on your own device, and are never transmitted to a third party.
        </p>

        <p>
          Ptero's source code is available at <a href="https://github.com/ptero-app/ptero/">https://github.com/ptero-app/ptero/</a>, and is open source under the Mozilla Public License.
          Feature planning is currently noted in the <a href="https://github.com/ptero-app/ptero/blob/main/TODO">TODO</a> document in the source code.
        </p>

        <h2>Using Ptero</h2>
        <h3>Posting Limits</h3>
        <p>
          At present, Ptero only supports posts of up to 300 characters (the bluesky limit, because the default mastodon limit is 500), with one image attached.
        </p>

        <h3>Adding Credentials</h3>
        <p><strong>Note!</strong> At present, Ptero will post using all your configured credentials. Selective posting is a future feature.</p>

        <p>
          Under the "Manage Credentials" tab, you're given a form to add a new set of credentials for multi-posting.
          You can also clear all your currently saved credentials from this same screen.
          There is not currently a way to remove or modify a single credential.
        </p>

        <p>
          <strong>To add a Bluesky account</strong>, it is <strong>strongly</strong> suggested that you create an app password.
          You can do this in the bsky.app's settings page <a href="https://bsky.app/settings/app-passwords">bsky.app/settings/app-passwords</a>.
        </p>
        <p>The recommended settings are:</p>
        <ul>
          <li><strong>Server:</strong> <code>https://bsky.social</code>. You can technically use another server if it also speaks the atproto, but to use the main bluesky service, use <code>https://bsky.social</code></li>
          <li><strong>Username:</strong> either your handle on bluesky, minus the <code>@</code> symbol (so if you're <code>@anexample.bsky.social</code>, you should use <code>anexample.bsky.social</code>), or the email address you use to login</li>
          <li><strong>API Key/App Password:</strong> this should be an app password you generated. You can use your regular password, but I strongly recommend using an app password.</li>
        </ul>

        <p>
          <strong>To add a Mastodon account</strong>, you must create a new development app, and use the access token generated for that app.
          To do this, open Preferences, and pick Development from the sidebar (or navigate to <code>yourmastodonserver.com/settings/applications</code>).
          Ptero requires the <code>write:media</code> and <code>write:statuses</code> scopes.
        </p>
        <p>The recommended settings are:</p>
        <ul>
          <li><strong>Server:</strong> Your mastodon server's domain, for example <code>https://mastodon.social</code></li>
          <li><strong>Username:</strong> This is technically not required, you can add a name here for personal reference</li>
          <li><strong>API Key/App Password:</strong> this is the access token for the development app you generated.</li>
        </ul>
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

  p {
    margin-bottom: 1em;
  }

  .tab ul {
    margin-bottom: 1em;
  }
</style>
