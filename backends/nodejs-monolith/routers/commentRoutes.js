const esClient  = require('node-eventstore-client')
const koaRouter = require('koa-router')
const { uuid }  = require('uuidv4')

const commentRoutes = ({ es }) => {
  const router = koaRouter()

  const getComments = async ctx => {
    const { page } = ctx.params
    const { events } = await es.readStreamEventsForward(`page-${page}`, 0, 1000)

    const comments = events
      .map(({ event }) => event)
      .filter(({ eventType }) => eventType === 'CommentAdded')
      .map(e => ({ ...JSON.parse(e.data.toString()), createdAt: e.created }))
      .filter(c => 'user' in c)
      .filter(c => 'text' in c)

    ctx.body = JSON.stringify(comments)
  }

  const putComment = async ctx => {
    if (!ctx.state.user) {
      ctx.status = 401
      return
    }

    const { user } = ctx.state

    const { text } = ctx.request.body
    const { id, page } = ctx.params

    const event = esClient.createJsonEventData(
      uuid(), { comment: id, text, user }, null, 'CommentAdded'
    )
    await es.appendToStream(`page-${page}`, esClient.expectedVersion.any, event)

    ctx.body = JSON.stringify({ text, user })
  }

  return router
    .get('/pages/:page/comments', getComments)
    .put('/pages/:page/comments/:id', putComment)
    .routes()
}

module.exports = commentRoutes
