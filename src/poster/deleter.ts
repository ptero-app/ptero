import {
  BskyAgent,
  ComAtprotoRepoApplyWrites as ApplyWrites,
  ComAtprotoRepoListRecords as RepoList,
  ComAtprotoServerCreateSession as CreateSession
} from '@atproto/api'

import { AtUri } from '@atproto/syntax'

import type { Credential } from './types'

const bskyPostFeed: string = 'app.bsky.feed.post'
const bskyRepostFeed: string = 'app.bsky.feed.repost'

interface hasCreatedAt {
  createdAt: string
}

export class Deleter {
  creds: Credential
  agent: BskyAgent
  posts: RepoList.Record[]
  reposts: RepoList.Record[]
  loggedIn: boolean

  constructor(creds: Credential) {
    this.creds = creds
    this.posts = []
    this.reposts = []
    this.agent = new BskyAgent({ service: creds.server })
    this.loggedIn = false
  }

  async _login(): Promise<CreateSession.Response | null> {
    return new Promise<CreateSession.Response | null>((resolve, reject) => {
      if (this.loggedIn) {
        resolve(null)
      }

      this.agent
        .login({
          identifier: this.creds.username,
          password: this.creds.secretKey
        })
        .then((response) => {
          this.loggedIn = true
          resolve(response)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  async getPosts(): Promise<RepoList.Record[]> {
    await this._login()
    this.posts = await paginatedListRecords(this.agent, this.creds.username, bskyPostFeed)
    return this.posts
  }

  async postsToDelete(days: number = 14): Promise<ApplyWrites.Delete[]> {
    await this._login()

    if (this.posts.length == 0) {
      await this.getPosts()
    }

    const checkDate = new Date(Date.now() - daysToMs(days)).getTime()
    return this._buildDeletes(this.posts, checkDate, bskyPostFeed)
  }

  async deletePosts(days: number = 14): Promise<boolean> {
    await this._login()

    const posts = await this.postsToDelete(days)
    return this._delete(posts)
  }

  async getReposts(): Promise<RepoList.Record[]> {
    await this._login()
    this.reposts = await paginatedListRecords(this.agent, this.creds.username, bskyRepostFeed)
    return this.reposts
  }

  async repostsToDelete(days: number = 14): Promise<ApplyWrites.Delete[]> {
    await this._login()

    if (this.reposts.length == 0) {
      await this.getReposts()
    }

    const checkDate = new Date(Date.now() - daysToMs(days)).getTime()
    return this._buildDeletes(this.reposts, checkDate, bskyRepostFeed)
  }

  async deleteReposts(days: number = 14): Promise<boolean> {
    await this._login()
    const reposts = await this.repostsToDelete(days)
    return this._delete(reposts)
  }

  async _delete(records: ApplyWrites.Delete[]): Promise<boolean> {
    for (let i = 0; i < records.length; i += 200) {
      console.log(`Deleting batch ${(i % 200) + 1}`)
      const resp = await this.agent.api.com.atproto.repo.applyWrites({
        repo: this.creds.username,
        writes: records.slice(i, i + 200)
      })

      if (!resp.success) {
        return resp.success
      }
    }

    return true
  }

  _buildDeletes(
    records: RepoList.Record[],
    cutoff: number,
    collection: string
  ): ApplyWrites.Delete[] {
    return records
      .filter((record) => {
        const recordDate = Date.parse((record.value as hasCreatedAt).createdAt)
        return recordDate < cutoff
      })
      .map((record) => {
        const uri = new AtUri(record.uri)
        return {
          $type: 'com.atproto.repo.applyWrites#delete',
          rkey: uri.rkey,
          collection: collection
        }
      })
  }
}

function daysToMs(days: number): number {
  return days * 1000 * 60 * 60 * 25
}

async function paginatedListRecords(
  agent: BskyAgent,
  username: string,
  collection: string
): Promise<RepoList.Record[]> {
  const records: RepoList.Record[] = []

  const params: RepoList.QueryParams = {
    repo: username,
    collection: collection,
    limit: 100
  }

  while (true) {
    const response = await agent.api.com.atproto.repo.listRecords(params)

    if (!response.success) {
      throw new Error('Failed to get collection')
    }

    records.push(...response.data.records)

    if (response.data.cursor) {
      params.cursor = response.data.cursor
    } else {
      break
    }
  }

  return records
}
