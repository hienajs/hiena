import { Connection } from '../plugins/db/connection'
import { ExecuteControl } from '../plugins/db/control'
import { addDbLog } from './log'
import cache, { CacheControl } from './cache'

export default async function (context) {
  try {
    let con = Connection(context.config, { logging: (text) => {
      if (context.config.showSql) console.log(text)
      addDbLog(context.config, text)
    } })

    let models = { con }
    let modules = {}
    let migrations = []
    let seeds = []
    let scripts = []

    // Percorre os modulos
    Object.keys(context.modules).forEach(i => {
      let modulo = context.modules[i]

      // Pega as migrations
      let migrationItens = (modulo.db && modulo.db.migrations) ? modulo.db.migrations : []
      migrations.push(...migrationItens)

      // Pega os models
      let modelItens = (modulo.db && modulo.db.models) ? modulo.db.models : {}
      Object.keys(modelItens).forEach(x => {
        models[x] = modelItens[x](con)
        if (!modules[i]) modules[i] = { models: [] }
        modules[i].models.push(x)
        if (context.config.cache.enable) cache[x] = new CacheControl(context.config, x)
      })

      // Pega os seeds
      let seedItens = (modulo.db && modulo.db.seeds) ? modulo.db.seeds : []
      seeds.push(...seedItens)

      // Pega os seeds
      let scriptItens = (modulo.db && modulo.db.scripts) ? modulo.db.scripts : []
      scripts.push(...scriptItens)
    })

    // Percorre os models para criar associacoes
    if (context.config.cache.enable) models.cache = cache
    else models.cache = {}
    Object.keys(models).forEach(e => {
      if (context.config.cache.enable) models[e].cache = cache[e]
      else models[e].cache = {}
      if (models[e].associate) models[e].associate(models)
      if (models[e].methods) models[e].methods(models)
    })

    // Clean Cache
    if (context.config.cache.enable) await cache.cleanCache(context.config)

    return {
      models,
      modules,
      async execute () {
        // Controle de Execução
        const controle = new ExecuteControl(con, 'postgres')
        controle.setItens(migrations, seeds, scripts, models)
        await controle.exec()
      }
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
