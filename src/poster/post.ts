export type Image = {
  image: File
  description: String
}

export type Sensitivity = "none" | "sexual" | "nudity" | "porn"

export class Post {
  text: String
  images?: Image[]
  sensitivity?: Sensitivity
  contentWarning?: String
}
