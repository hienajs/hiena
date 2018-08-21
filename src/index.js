import { DataTypes, fn as sequelizeFn, where as sequelizeWhere, col as sequelizeCol, literal as sequelizeLiteral } from 'sequelize'
import { createTable, postgresCreateTable, postgresAddIndex, SequelizeModel } from './plugins/db/model'
import config from './config'
import util from './util'
import * as modules from './modules'

export {
  util,
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

export default async function (options = {}) {
  try {
    const context = {
      config: util.object.merge({}, config, options.config || {})
    }
    context.modules = options.modules || {}
    // Pega Objetos em Módulos
    let objects = await modules.getObjects(context)
    return {
      startService: () => modules.initServices(objects),
      startRest: () => modules.initRest(objects),
      startRestAndService: () => modules.initRestAndService(objects)
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}
