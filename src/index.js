import { DataTypes, fn as sequelizeFn, where as sequelizeWhere, col as sequelizeCol, literal as sequelizeLiteral } from 'sequelize'
import { createTable, postgresCreateTable, postgresAddIndex, SequelizeModel } from './plugins/db/model'
import config from './config'
import * as modules from './modules'
import thread from './thread'
import metodoThread from './thread/thread'
import * as object from './util/object'

export {
  DataTypes,
  sequelizeFn,
  sequelizeWhere,
  sequelizeCol,
  sequelizeLiteral,
  createTable,
  postgresCreateTable,
  postgresAddIndex,
  SequelizeModel
}

function trataParam (param) {
  if (param.includes('action:')) {
    let array = param.split('action:')
    return array[1]
  }
}

function verificaArgs () {
  let action = 'all'
  if (process.argv.length > 2) {
    process.argv.forEach((param, indice) => {
      if (indice >= 2) action = trataParam(param)
    })
  }
  return action
}

export default async function (options = {}) {
  try {
    const context = {
      action: verificaArgs(),
      config: object.merge({}, config, options.config || {})
    }
    context.modules = options.modules || {}
    // Pega Objetos em Módulos
    let objects = await modules.getObjects(context)
    // Acoes
    let acoes = {
      updateDB: async () => {
        // Threads
        await modules.updateDB()
        process.exit()
      },
      startService: () => {
        // Threads
        context.thread = thread(objects, options)
        modules.initServices(objects)
      },
      startRest: () => {
        // Threads
        context.thread = thread(objects, options)
        modules.initRest(objects)
      },
      startRestAndService: () => {
        // Threads
        context.thread = thread(objects, options)
        modules.initRestAndService(objects)
      }
    }

    switch (context.action) {
      case 'db':
        await acoes.updateDB()
        break
      case 'service':
        await acoes.startService()
        console.log('-- Services Rodando')
        break
      case 'rest':
        await acoes.startRest()
        break
      case 'all':
        await acoes.startRestAndService()
        break
      default:
        metodoThread(context, objects.mixins)
        break
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}
