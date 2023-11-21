import { ComAtprotoLabelDefs, AppBskyRichtextFacet, AppBskyFeedPost } from '@atproto/api'
import { BlobRef } from '@atproto/lexicon'

export type Dialect = 'mastodon' | 'bluesky'
export interface Credential {
  protocol: Dialect
  server: string
  username: string
  secretKey: string
}

export interface Image {
  image: File
  description: string
  blobUrl?: string
}

export type Sensitivity = 'none' | 'sexual' | 'nudity' | 'porn'

export interface Post {
  text: string
  images: Image[]
  sensitivity?: Sensitivity
  contentWarning?: string
  _replyRef?: AppBskyFeedPost.ReplyRef
}

export type BskyPost = {
  text: string
  embed?: BskyEmbed
  labels?: ComAtprotoLabelDefs.SelfLabels
  facets?: AppBskyRichtextFacet.Main[]
  reply?: AppBskyFeedPost.ReplyRef
}

export type BskyEmbed = {
  $type: string
  images?: BskyEmbedImage[]
}

export type BskyEmbedImage = {
  image: BlobRef
  alt: string
}

export type MastoPost = {
  status: string
  sensitive?: boolean
  spoilerText?: string
  mediaIds?: string[]
}

export type MastoMedia = {
  file: Blob
  description?: string
}
