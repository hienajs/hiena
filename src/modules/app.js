import { createServer } from 'http'
import { join } from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import socketIo from 'socket.io'
import ioRedisAdapter from 'socket.io-redis'
import { startRoute } from './modules'

export default function (context, controllers, mixins) {
  // Cria instancia do express
  let app = express()
  // Morgan console
  if (context.config.server.morgan) {
    app.use(require('morgan')('tiny'))
  }

  // Inicia o server
  const server = createServer(app)
  // Timeout da config
  server.timeout = context.config.server.timeout

  // Conexão via socket
  let io = null
  if (context.config.socket.enable) {
    let io = socketIo(server)
    io.set('transports', ['websocket'])
    io.adapter(ioRedisAdapter({ host: context.config.socket.redis.host, port: context.config.socket.redis.port }))
  }

  // Middlewares de segurança e transformação
  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(helmet.frameguard())
  app.use(helmet.xssFilter())
  app.use(helmet.noSniff())
  app.use(helmet.ieNoOpen())
  app.disable('x-powered-by')

  // Pasta Statica
  app.use('/static', express.static(join(context.config.dirname, './static')))
  // Pasta de imagens/arquivos publicas
  app.use('/public', express.static(join(context.config.dirname, './files/public')))

  // Express Join IO
  app.io = io
  // Routes
  app = startRoute(app, context, controllers, mixins)

  // Rotas não encontradas
  function err (req, res) {
    return res.status(404).json({ error: 'Método não encontrado!' })
  }

  app.get('*', err)
  app.post('*', err)
  app.put('*', err)
  app.delete('*', err)
  return { app, server }
}
