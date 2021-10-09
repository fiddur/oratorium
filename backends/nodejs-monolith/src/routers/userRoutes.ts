import Router, { Middleware } from '@koa/router'
import { DefaultState } from 'koa'
import { AppContext } from '../server'
import httpAssert from 'ts-http-assert'
import { EventStoreNodeConnection } from 'node-eventstore-client'

export const userRoutes = ({
  es,
}: {
  es: EventStoreNodeConnection
}): Middleware<DefaultState, AppContext> => {
  const router = new Router()

  router.get('/users/me', async (ctx) => {
    console.log('me')
    httpAssert(!!ctx.state.user, 401)

    const {
      user: { sub, iss, name, picture, exp },
    } = ctx.state

    ctx.body = { sub, iss, name, picture, exp }
  })

  return router.routes()
}
