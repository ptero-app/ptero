import { ComAtprotoLabelDefs } from '@atproto/api'
import { BlobRef } from '@atproto/lexicon'

export type Dialect = "mastodon" | "bluesky"
export type Credential = {
  protocol: Dialect;
  server: string;
  username: string;
  secretKey: string;
}

export type Image = {
  image: File
  description: string
}

export type Sensitivity = "none" | "sexual" | "nudity" | "porn"

export type Post = {
  text: string
  images?: Image[]
  sensitivity?: Sensitivity
  contentWarning?: string
}

export type BskyPost = {
  text: string
  embed?: BskyEmbed
  labels?: ComAtprotoLabelDefs.SelfLabels
}

export type BskyEmbed = {
  $type: string
  images?: BskyEmbedImage[]
}

export type BskyEmbedImage = {
  image: BlobRef
  alt: string
}
