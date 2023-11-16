# ptero

ptero is a federated cross-poster web app, for creating the same post with multiple accounts on services that speak the Mastodon and Bluesky protocols.

## dev environment

ptero is tested and built using bun

``` bash
bun run dev
```

will start up ptero in dev mode, with file watches and automatic refresh for vue components

``` bash
bun run build
```

is used to produce the standalone dist directory, used by github pages to serve [ptero.app](https://ptero.app)
