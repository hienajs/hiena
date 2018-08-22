import cluster from 'cluster'
import app from './app'
import db from '../db/'
import { createControllerAndMixins, startService } from './modules'

export async function getObjects (context) {
  let { models, modules, execute } = await db(context)
  const { controllers, mixins } = createControllerAndMixins(context, models, modules)
  if (cluster.isMaster) await execute()
  return { models, modules, execute, controllers, mixins, context }
}

export async function initServices (objects) {
  return cluster.isMaster ? startService(objects.context, objects.controllers, objects.mixins) : null
}

export async function initRest (objects) {
  if (cluster.isMaster && objects.context.config.numProcess > 1) {
    for (let i = 0; i < objects.context.config.numProcess; i++) cluster.fork()
  } else {
    let instance = app(objects.context, objects.controllers, objects.mixins)
    instance.app.set('port', objects.context.config.server.port)
    instance.server.listen(objects.context.config.server.port, () =>
      console.log(`Server iniciado ID#${cluster.worker ? cluster.worker.id : '0'} PID#${process.pid} escutando em http://localhost::${objects.context.config.server.port}`)
    )
  }
}

export async function initRestAndService (objects) {
  await initServices(objects)
  return initRest(objects)
}