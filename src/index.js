import { DataTypes, fn as sequelizeFn, where as sequelizeWhere, col as sequelizeCol, literal as sequelizeLiteral } from 'sequelize'
import { createTable, postgresCreateTable, postgresAddIndex, SequelizeModel } from './plugins/db/model'
import config from './config'
import * as modules from './modules'
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

export default async function (options = {}) {
  try {
    const context = {
      config: object.merge({}, config, options.config || {})
    }
    context.modules = options.modules || {}
    // Pega Objetos em Módulos
    let objects = await modules.getObjects(context)
    return {
      updateDB: async () => {
        await modules.updateDB()
        process.exit()
      },
      startService: () => modules.initServices(objects),
      startRest: () => modules.initRest(objects),
      startRestAndService: () => modules.initRestAndService(objects)
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}
