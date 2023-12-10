<script setup lang="ts"></script>

<template>
  <section id="about">
    <h2>About Ptero</h2>

    <p>
      Ptero is an app for posting to both Mastodon and Bluesky at the same time (and supports
      posting to multiple accounts for each service).
    </p>

    <p>
      Ptero runs completely in your web browser, meaning your credentials stay completely on your
      own device, and are never transmitted to a third party.
    </p>

    <p>
      Ptero's source code is available at
      <a href="https://github.com/ptero-app/ptero/">https://github.com/ptero-app/ptero/</a>, and is
      open source under the Mozilla Public License. Feature planning is currently noted in the
      <a href="https://github.com/ptero-app/ptero/blob/main/TODO">TODO</a> document in the source
      code.
    </p>

    <p>Ptero logo by <a href="https://portableclouds.net/">Portableclouds</a>.</p>

    <h2>Using Ptero</h2>
    <h3>Posting Limits</h3>
    <p>
      At present, Ptero only supports posts of up to 300 characters (the bluesky limit, because the
      default mastodon limit is 500). Images are limited to 1MB in size (the bluesky limit --
      compressing them automatically is a nice to have feature for the future).
    </p>

    <h3>Adding Credentials</h3>
    <p>
      <strong>Note!</strong> At present, Ptero will post using all your configured credentials.
      Selective posting is a future feature.
    </p>

    <p>
      Under the "Manage Credentials" tab, you're given a form to add a new set of credentials for
      multi-posting. You can also edit existing credentials and clear all your currently saved
      credentials from this same screen. There is not currently a way to remove a single credential.
    </p>

    <p>
      <strong>To add a Bluesky account</strong>, it is <strong>strongly</strong> suggested that you
      create an app password. You can do this in the bsky.app's settings page
      <a href="https://bsky.app/settings/app-passwords">bsky.app/settings/app-passwords</a>.
    </p>
    <p>The recommended settings are:</p>
    <ul>
      <li>
        <strong>Server:</strong> <code>https://bsky.social</code>. You can technically use another
        server if it also speaks the atproto, but to use the main bluesky service, use
        <code>https://bsky.social</code>. You <strong>must</strong> include the <code>https</code>.
      </li>
      <li>
        <strong>Username:</strong> either your handle on bluesky, minus the <code>@</code> symbol
        (so if you're <code>@anexample.bsky.social</code>, you should use
        <code>anexample.bsky.social</code>), or the email address you use to login. If you're using
        the post delete function, you must use your handle.
      </li>
      <li>
        <strong>API Key/App Password:</strong> this should be an app password you generated. You can
        use your regular password, but I strongly recommend using an app password.
      </li>
    </ul>

    <p>
      <strong>To add a Mastodon account</strong>, you must create a new development app, and use the
      access token generated for that app. To do this, open Preferences, and pick Development from
      the sidebar (or navigate to <code>yourmastodonserver.com/settings/applications</code>). Ptero
      requires the <code>write:media</code> and <code>write:statuses</code> scopes.
    </p>
    <p>The recommended settings are:</p>
    <ul>
      <li>
        <strong>Server:</strong> Your mastodon server's domain, for example
        <code>https://mastodon.social</code>
      </li>
      <li>
        <strong>Username:</strong> This is technically not required, you can add a name here for
        personal reference
      </li>
      <li>
        <strong>API Key/App Password:</strong> this is the access token for the development app you
        generated.
      </li>
    </ul>

    <h3>Mass Deleting Bluesky Posts</h3>
    <p>
      With Bluesky announcing that they're going to open up the main web app for public consumption,
      people were looking for a way to easily delete old posts. That's what the mass deleter is for.
    </p>

    <p>
      If you've added at least one set of bluesky credentials, you can use the "Mass Delete Posts"
      tab to delete all posts or reposts older than a certain age (to delete them all, set the
      number of days to keep to <code>0</code>). Posts are reposts are a separate button, because
      that's how bluesky organizes them internally, and my own preference is to delete reposts
      sooner than posts.
    </p>

    <p>This feature only works with Bluesky, because mastodon has it built in.</p>
  </section>
</template>

<style scoped lang="scss"></style>
