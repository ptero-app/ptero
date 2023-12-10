/*
import localforage from 'localforage'
import { createRestAPIClient, createOAuthAPIClient } from 'masto'
import type { mastodon } from 'masto'

const lf = localforage.createInstance({ name: 'mastodonClients' })

type appConfig = {
  client_id: string
  client_secret: string
  oauth_token?: string
}

export async function getMastodonClient(server: string): Promise<mastodon.rest.Client> {
  const lfResult = JSON.parse(lf.getItem(server))
  if (lfResult !== null) {
    return createRestAPIClient({
      url: server,
      accessToken: lfResult.oauth_token
    })
  }

  const queryParams = new URLSearchParams({
    action: 'mastoRegister',
    server: server
  })
  const redirectUri = new URL(window.location.href)
  redirectUri.search = queryParams.toString()

  const appClient = createRestAPIClient({ url: server })
  const app = await appClient.v1.app.create({
    clientName: 'ptero',
    redirectUris: redirectUri,
    scopes: 'write:media write:status read:accounts',
    website: `${window.location.protocol}//${window.location.host}`
  })

  /* NOTES!!
   *
   * redirect uri can include query params, so we can have it be `<window.location.href>?action=mastToken&server=<server>`, and the redirect will be `?action-mastToken&server=<server>&code=<code from masto>`
   *
   * we should update to scope = read:accounts, and then be able to call v1.accounts.verifyCredentials and get the username for the current user
   * /
}
*/
