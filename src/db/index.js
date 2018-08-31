import create from './create'

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
    let { cache, models, modules, execute } = await create(context, context.config.db.dialect)
    result.cache = cache
    result.models = models
    result.modules = modules
    result.execute = execute
  }

  return result
}
