import { BskyAgent } from '@atproto/api'

import type { Credential, Dialect } from './types'
import { Post } from './post'

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
        throw new Error(`${creds.protocol} not implemented`)
    }
  }

  async _bluesky(post: Post): Promise<String> {
    const agent = new BskyAgent({service: this.creds.server})

    await agent.login({
      identifier: this.creds.username,
      password: this.creds.secretKey,
    })

    let bskyPost = {
      text: post.text,
    }

    try {
      if (post.images) {
        bskyPost["embed"] = {
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

          bskyPost.embed.images.push({
            image: blob.data.blob,
            alt: image.description,
          })
        }

        console.log("sensitivity", post.sensitivity)
        console.log(post)
        if (post.sensitivity && post.sensitivity != "none") {
          bskyPost["labels"] = {
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

async function syncReader(file: File): Promise {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = (evt) => {
      resolve(evt.target.result)
    }

    reader.onerror = (evt) => {
      reject(evt.target.error)
    }

    reader.readAsArrayBuffer(file)
  })
}
