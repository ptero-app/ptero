import { BskyAgent, AppBskyEmbedImages } from '@atproto/api'
import { createRestAPIClient as createMastoClient } from 'masto'

import type { Credential, Dialect, Post, BskyPost, BskyEmbed, MastoPost, MastoMedia } from './types'

export class Poster {
  creds: Credential

  constructor(creds: Credential) {
    this.creds = creds
  }

  async post(post: Post): Promise<String> {
    switch(this.creds.protocol) {
      case "bluesky":
        return this._bluesky(post)

      case "mastodon":
        return this._mastodon(post)

      default:
        throw new Error(`${this.creds.protocol} not implemented`)
    }
  }

  async _bluesky(post: Post): Promise<String> {
    const agent = new BskyAgent({service: this.creds.server})

    await agent.login({
      identifier: this.creds.username,
      password: this.creds.secretKey,
    })

    let bskyPost: BskyPost = {
      text: post.text,
    }

    try {
      if (post.images?.length) {
        let embed: BskyEmbed = {
          $type: "app.bsky.embed.images",
          images: [],
        }

        for (let idx = 0; idx < post.images.length; idx++) {
          const image = post.images[idx]

          if (image.image.size > 1000000) {
            throw new Error("image too large")
          }

          const binaryRep = await syncReader(image.image)
          const blob = await agent.uploadBlob(binaryRep, {encoding: image.image.type})

          embed.images?.push({
            image: blob.data.blob,
            alt: image.description,
          })
        }

        bskyPost.embed = embed

        if (post.sensitivity && post.sensitivity != "none") {
          bskyPost.labels = {
            $type: "com.atproto.label.defs#selfLabels",
            values: [{val: post.sensitivity}],
          }
        }
      }

      const response = await agent.post(bskyPost)

      const uriPath = response.uri.split("/").pop()
      const postUrl = `https://bsky.app/profile/${this.creds.username}/post/${uriPath}`
      return postUrl
    } catch (e) {
      throw e
    }
  }

  async _mastodon(post: Post): Promise<String> {
    const client = createMastoClient({
      url: this.creds.server,
      accessToken: this.creds.secretKey,
    })

    let mastoPost: MastoPost = {
      status: post.text,
    }

    if (post.images?.length) {
      let mediaIds: string[] = []

      for (const image of post.images) {
        let input: MastoMedia = {
          file: image.image,
        }

        if (image.description?.length) {
          input.description = image.description
        }

        const response = await client.v2.media.create(input)
        mediaIds.push(response.id)
      }

      mastoPost.mediaIds = mediaIds
    }

    if (post.sensitivity && post.sensitivity != "none") {
      mastoPost.sensitive = true
    }

    if (post.contentWarning?.length) {
      mastoPost.spoilerText = post.contentWarning
      mastoPost.sensitive = true
    }

    const status = await client.v1.statuses.create(mastoPost)
    if (!status.url) {
      throw new Error(`no url on status -- uri: ${status.uri}`)
    }

    return status.url
  }
}

async function syncReader(file: File): Promise<Uint8Array> {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = (evt) => {
      const target = (evt as ProgressEvent).target as FileReader
      const result = target.result as ArrayBuffer

      resolve(new Uint8Array(result))
    }

    reader.onerror = (evt) => {
      const target = (evt as ProgressEvent).target as FileReader
      reject(target.error)
    }

    reader.readAsArrayBuffer(file)
  })
}
