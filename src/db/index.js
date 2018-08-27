import mysql from './mysql'
import postgres from './postgres'

export default async function (context) {
  const result = {
    cache: {},
    models: {},
    modules: {},
    async execute () {
      return true
    }
  }
  if (context.config.db.dialect && context.config.db.url) {
    if (context.config.db.dialect === 'mysql') {
      let { cache, models, modules, execute } = await mysql(context)
      result.cache = cache
      result.models = models
      result.modules = modules
      result.execute = execute
    }
    if (context.config.db.dialect === 'postgres') {
      let { cache, models, modules, execute } = await postgres(context)
      result.cache = cache
      result.models = models
      result.modules = modules
      result.execute = execute
    }
  }

  return result
}
