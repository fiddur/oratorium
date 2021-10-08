import esClient from 'node-eventstore-client'
import Koa, { DefaultContext, DefaultState } from 'koa'
import koaBody from 'koa-body'
import koaJwt from 'koa-jwt'
import session from 'koa-session'
import cors from '@koa/cors'

import { authRoutes } from './routers/authRoutes'
import { commentRoutes } from './routers/commentRoutes'
import { config } from './config'

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'changeme'
const esEndpoint = process.env.ES_ENDPOINT || config.eventstore || 'tcp://localhost:1113'
const port = process.env.PORT || 3000

// export interface AppState extends Koa.DefaultState {
//   //...
// }

export interface AppContext extends DefaultContext {
  session: { code_verifier: string }
}

const main = async () => {
  console.log('Starting oratoritum')
  const app = new Koa<DefaultState, AppContext>()
  app.use(koaBody({ jsonLimit: '1kb' }))
  app.use(cors({ credentials: true, exposeHeaders: ['content-type'] }))
  app.use(koaJwt({ cookie: 'accessToken', secret: accessTokenSecret, passthrough: true }))
  app.keys = ['some secret hurr']
  app.use(session(app as unknown as Koa))

  console.log('loaded middlewared')

  const es = esClient.createConnection({}, esEndpoint)
  console.log('connecting to es...')
  es.connect()
  es.on('error', (m) => console.error(m))
  es.on('disconnected', (m) => console.error(m))
  es.on('closed', (m) => console.error(m))
  await new Promise((resolve) => es.once('connected', resolve)) // Add error message.
  console.log('connected es')

  console.log(authRoutes)
  const authRoutess = await authRoutes({ accessTokenSecret, config })
  console.log(authRoutess)
  app.use(authRoutess)
  app.use(commentRoutes({ es }))

  app.listen({ port, host: '0.0.0.0' })
  console.log(`Listening on ${port}`)
}

main()
