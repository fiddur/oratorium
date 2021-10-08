import { createJsonEventData, EventStoreNodeConnection, expectedVersion } from 'node-eventstore-client'
import Router, { Middleware } from '@koa/router'
import { uuid } from 'uuidv4'
import { DefaultState } from 'koa'
import { AppContext } from '../server'

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export const commentRoutes = ({
  es,
}: {
  es: EventStoreNodeConnection
}): Middleware<DefaultState, AppContext> => {
  const router = new Router()

  router.get('/pages/:page/comments', async (ctx) => {
    const { page } = ctx.params
    const { events } = await es.readStreamEventsForward(`page-${page}`, 0, 1000)

    const comments = events
      .map(({ event }) => event)
      .filter(notEmpty)
      .filter(({ eventType }) => eventType === 'CommentAdded')
      .map(({ data }) => data)
      .filter(notEmpty)
      .map((data) => ({ ...JSON.parse(data.toString()) }))
      .filter((c) => 'user' in c)
      .filter((c) => 'text' in c)

    ctx.body = JSON.stringify(comments)
  })

  router.put('/pages/:page/comments/:id', async (ctx) => {
    if (!ctx.state.user) {
      ctx.status = 401
      return
    }

    const { user } = ctx.state

    const { text } = ctx.request.body
    const { id, page } = ctx.params

    const event = createJsonEventData(uuid(), { comment: id, text, user }, null, 'CommentAdded')
    await es.appendToStream(`page-${page}`, expectedVersion.any, event)

    ctx.body = JSON.stringify({ text, user })
  })

  return router.routes()
}
