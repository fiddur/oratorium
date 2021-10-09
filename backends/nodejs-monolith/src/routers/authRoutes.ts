import { Issuer, generators } from 'openid-client'
import Router, { Middleware } from '@koa/router'
import { sign } from 'jsonwebtoken'
import { DefaultState } from 'koa'
import { AppContext } from '../server'

interface OidcProvider {
  client_id: string
  client_secret: string
  issuer: string
  title: string
  icon: string
}

const daySeconds = 60 * 60 * 24

export const authRoutes = async ({
  config: { host, oidcProviders },
  accessTokenSecret,
}: {
  config: { host: string; oidcProviders: Record<string, OidcProvider> }
  accessTokenSecret: string
}): Promise<Middleware<DefaultState, AppContext>> => {
  const router = new Router<DefaultState, AppContext>()

  const clients = Object.fromEntries(
    await Promise.all(
      Object.entries(oidcProviders).map(async ([shortName, { client_id, client_secret, issuer }]) => {
        const discoveredIssuer = await Issuer.discover(issuer)
        console.log('Discovered issuer %s %O', discoveredIssuer.issuer, discoveredIssuer.metadata)

        const client = new discoveredIssuer.Client({
          client_id,
          client_secret,
          redirect_uris: [`${host}/auth/${shortName}/callback`],
          response_types: ['code'],
        })
        return [shortName, client]
      }),
    ),
  )

  router.get('/auth/providers', (ctx) => {
    ctx.set('Cache-Control', `max-age=${daySeconds}`)
    ctx.body = Object.entries(oidcProviders).map(([shortName, { title, icon }]) => ({
      shortName,
      title,
      icon,
    }))
  })

  router.get('/auth/:provider', (ctx) => {
    const { provider } = ctx.params
    const code_verifier = generators.codeVerifier()
    ctx.session.code_verifier = code_verifier
    const code_challenge = generators.codeChallenge(code_verifier)

    const client = clients[provider]
    const authorizationUrl = client.authorizationUrl({
      code_challenge,
      scope: 'openid email profile',
      code_challenge_method: 'S256',
    })

    ctx.redirect(authorizationUrl)
  })

  router.get('/auth/:provider/callback', async (ctx) => {
    const { provider } = ctx.params
    const { code_verifier } = ctx.session

    const client = clients[provider]
    const parameters = client.callbackParams(ctx.request)

    console.log('back with params', parameters)
    const tokenSet = await client.callback(`${host}/auth/${provider}/callback`, parameters, { code_verifier })

    const { sub, iss, name, picture } = tokenSet.claims()
    const user = { sub, iss, name, picture }
    const accessToken = sign(user, accessTokenSecret, { expiresIn: '1h' })

    ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    ctx.set('Pragma', 'no-cache')
    ctx.set('Expires', '0')
    ctx.cookies.set('accessToken', accessToken)
    ctx.body = `
      <html><head></head><body>
        <script>
          window.opener.postMessage({ authenticated: true, user: ${JSON.stringify({ user })}}, '*')
          window.close()
        </script>
      </body></html>
    `
  })

  return router.routes()
}
