import { createJsonEventData, EventStoreNodeConnection, expectedVersion } from 'node-eventstore-client'
import Router, { Middleware } from '@koa/router'
import { uuid } from 'uuidv4'
import { DefaultState } from 'koa'
import { AppContext } from '../server'
import httpAssert from 'ts-http-assert'

const notEmpty = <T>(val: T | null | undefined): val is T => val !== null && val !== undefined

interface CommentAddedEvent {
  comment: string
  text: string
  user: {
    sub: string
    iss: string
  }
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
    httpAssert(!!ctx.state.user, 401)

    const {
      user: { sub, iss },
    } = ctx.state

    const user = { sub, iss }
    const { text } = ctx.request.body
    const { id, page } = ctx.params

    httpAssert(!!text && text !== '', 400, 'text required')
    httpAssert(!!id && id !== '', 400, 'comment id required')
    httpAssert(!!page && page !== '', 400, 'page required')

    const commentAdded: CommentAddedEvent = { comment: id, text, user }
    const event = createJsonEventData(uuid(), commentAdded, null, 'CommentAdded')
    await es.appendToStream(`page-${page}`, expectedVersion.any, event)

    ctx.body = JSON.stringify({ text, user })
  })

  return router.routes()
}
