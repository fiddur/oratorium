const esClient   = require('node-eventstore-client')
const Koa        = require('koa')
const koaBody    = require('koa-body')
const koaJwt     = require('koa-jwt')
const koaSession = require('koa-session2')
const cors       = require('@koa/cors')

const authRoutes    = require('./routers/authRoutes')
const commentRoutes = require('./routers/commentRoutes')
const config        = require('./config')

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'changeme'
const esEndpoint        = process.env.ES_ENDPOINT || config.eventstore || 'tcp://localhost:1113'
const port              = process.env.PORT || 3000

const main = async () => {
  const app = new Koa()
  app.use(koaBody({ jsonLimit: '1kb' }))
  app.use(cors({ credentials: true, exposeHeaders: ['content-type'] }))
  app.use(koaJwt({ cookie: 'accessToken', secret: accessTokenSecret, passthrough: true }))
  app.use(koaSession())

  const es = esClient.createConnection({}, esEndpoint)
  es.connect()
  await new Promise(resolve => es.once('connected', resolve)) // Add error message.

  app.use(await authRoutes({ accessTokenSecret, config }))
  app.use(await commentRoutes({ es }))

  app.listen({ port, host: '0.0.0.0' })
  console.log(`Listening on ${port}`)
}

main()
