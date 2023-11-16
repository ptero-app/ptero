import { BskyAgent, AppBskyEmbedImages } from '@atproto/api'

import type { Credential, Dialect, Post, BskyPost, BskyEmbed } from './types'

export class Poster {
  creds: Credential

  constructor(creds: Credential) {
    this.creds = creds
  }

  async post(post: Post): Promise<String> {
    switch(this.creds.protocol) {
      case "bluesky":
        return this._bluesky(post)
        break

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
}

async function syncReader(file: File): Promise<Uint8Array> {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = (evt) => {
      const target = (evt as ProgressEvent).target as FileReader
      const result = target.result as ArrayBuffer

      return new Uint8Array(result)
    }

    reader.onerror = (evt) => {
      const target = (evt as ProgressEvent).target as FileReader
      reject(target.error)
    }

    reader.readAsArrayBuffer(file)
  })
}
