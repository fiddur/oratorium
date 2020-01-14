const esClient   = require('node-eventstore-client')
const Koa        = require('koa')
const koaBody    = require('koa-body')
const koaJwt     = require('koa-jwt')
const koaRouter  = require('koa-router')
const koaSession = require('koa-session2')
const cors       = require('@koa/cors')

const authRoutes    = require('./routers/authRoutes')
const commentRoutes = require('./routers/commentRoutes')
const config        = require('./config')

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'changeme'
const esEndpoint        = process.env.ES_ENDPOINT || config.eventstore || 'tcp://localhost:1113'
const port              = process.env.PORT || 3000

const main = async () => {
  console.log('setting up')
  const app = new Koa()
  app.use(koaBody({ jsonLimit: '1kb' }))
  app.use(cors({ credentials: true, exposeHeaders: ['content-type'] }))
  app.use(koaJwt({ cookie: 'accessToken', secret: accessTokenSecret, passthrough: true }))
  app.use(koaSession())

  const router = koaRouter()

  const es = esClient.createConnection({}, esEndpoint)
  console.log('connecting es')
  es.connect()
  console.log('connection initiated')
  await new Promise(resolve => es.once('connected', resolve))
  console.log('connected es')

  app.use(await authRoutes({ accessTokenSecret, config }))
  app.use(await commentRoutes({ es }))

  app.use(router.routes())

  app.listen({ port, host: '0.0.0.0' })
  console.log('Listening')
}

main()
