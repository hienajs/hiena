import mysql from './mysql'
import postgres from './postgres'

export default async function (context) {
  const result = {
    models: {},
    modules: {},
    async execute () {
      return true
    }
  }
  if (context.config.db.dialect && context.config.db.url) {
    if (context.config.db.dialect === 'mysql') {
      let { models, modules, execute } = await mysql(context)
      result.models = models
      result.modules = modules
      result.execute = execute
    }
    if (context.config.db.dialect === 'postgres') {
      let { models, modules, execute } = await postgres(context)
      result.models = models
      result.modules = modules
      result.execute = execute
    }
  }

  return result
}
