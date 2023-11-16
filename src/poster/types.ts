type Dialect = "mastodon" | "bluesky"
type Credential = {
  protocol: Dialect;
  server: string;
  username: string;
  secretKey: string;
}

export type { Dialect, Credential }
