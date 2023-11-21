import { BskyAgent, RichText, AtUri } from '@atproto/api'
import { createRestAPIClient as createMastoClient } from 'masto'

import type { Credential, Post, BskyPost, BskyEmbed, MastoPost, MastoMedia } from './types'

export const MaxImageSize = 1000000;

export interface PostResponse {
  url: string
  uid?: string
  cid?: string
  bskyUri?: string
}

export class Poster {
  creds: Credential
  _bskyAgent?: BskyAgent


  constructor(creds: Credential) {
    this.creds = creds
  }

  async post(post: Post): Promise<PostResponse> {
    switch(this.creds.protocol) {
      case "bluesky":
        return this._bluesky(post)

      case "mastodon":
        return this._mastodon(post)

      default:
        throw new Error(`${this.creds.protocol} not implemented`)
    }
  }

  async postMany(posts: Post[]): Promise<PostResponse> {
    switch(this.creds.protocol) {
      case "bluesky":
        return this._blueskyMany(structuredClone(posts))

      // case "mastodon":
      //   return this._mastodonMany(structuredClone(posts))

      default:
        throw new Error(`${this.creds.protocol} not implemented`)
    }
  }

  async _bskyLogin(): Promise<BskyAgent> {
    if (this._bskyAgent !== undefined) {
      return this._bskyAgent
    }

    this._bskyAgent = new BskyAgent({service: this.creds.server})
    await this._bskyAgent.login({
      identifier: this.creds.username,
      password: this.creds.secretKey,
    })

    return this._bskyAgent
  }

  async _bluesky(post: Post): Promise<PostResponse> {
    const agent = await this._bskyLogin()


    const text = new RichText({text: post.text})
    await text.detectFacets(agent)

    const bskyPost: BskyPost = {
      text: text.text,
      facets: text.facets,
    }

    if (post._replyRef !== undefined) {
      bskyPost.reply = post._replyRef
    }

    if (post.images?.length) {
      const embed: BskyEmbed = {
        $type: "app.bsky.embed.images",
        images: [],
      }

      for (let idx = 0; idx < post.images.length; idx++) {
        const image = post.images[idx]

        if (image.image.size > MaxImageSize) {
          throw new Error("Image too large")
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

    return {
      url: postUrl,
      cid: response.cid,
      bskyUri: response.uri,
    }
  }

  async _blueskyMany(posts: Post[]): Promise<PostResponse> {
    const responses: PostResponse[] = []

    try {
      for (const post of posts) {
        if (responses.length > 0) {
          const root = responses[0]
          const parent = responses[responses.length - 1]

          post._replyRef = {
            root: {
              uri: root.bskyUri as string,
              cid: root.cid as string,
            },
            parent: {
              uri: parent.bskyUri as string,
              cid: parent.cid as string,
            },
          }
        }

        const resp = await this._bluesky(post)
        responses.push(resp)
      }
    } catch (err) {
      responses.reverse()

      const agent = await this._bskyLogin()
      for (const resp of responses) {
        await agent.deletePost(resp.bskyUri as string)
      }

      throw err
    }

    return responses[0]
  }

  async _mastodon(post: Post): Promise<PostResponse> {
    const client = createMastoClient({
      url: this.creds.server,
      accessToken: this.creds.secretKey,
    })

    const mastoPost: MastoPost = {
      status: post.text,
    }

    if (post.images?.length) {
      const mediaIds: string[] = []

      for (const image of post.images) {
        const input: MastoMedia = {
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

    return {url: status.url}
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
