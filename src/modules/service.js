import { addServiceLog } from '../db/log'

async function compose (methods, mixins) {
  if (methods.length === 0) throw new Error('Nenhuma funcão localizada')
  let all = {}
  let data = {}
  for (const x in methods) {
    all.models = methods[x].models
    all.config = methods[x].context.config
    all.cache = methods[x].context.cache
    all.params = methods[x].params
    all.mixins = mixins
    data = await methods[x].controller(all)
  }
  return data
}

async function executeOne (config, methods, mixins) {
  try {
    let data = await compose(methods, mixins)
    addServiceLog(config, true, data)
    return true
  } catch (e) {
    addServiceLog(config, false, e.toString())
    return true
  }
}

function execute (config, methods, mixins, time) {
  // Executa somente uma vez
  if (time === 0 || time === -1) {
    executeOne(config, methods, mixins)
  } else {
    setTimeout(async () => {
      await executeOne(config, methods, mixins)
      execute(config, methods, mixins, time)
    }, time)
  }
}

function defineAgenda (time) {
  let amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  amanha.setHours(time.substr(0, time.indexOf(':')))
  amanha.setMinutes(time.substr(time.indexOf(':') + 1))
  amanha.setSeconds(0)
  return amanha.getTime() - new Date().getTime()
}

function agendar (config, methods, mixins, time) {
  let agendado = defineAgenda(time)
  setTimeout(async () => {
    await executeOne(config, methods, mixins)
    agendar(config, methods, mixins, time)
  }, agendado)
}

export function ctrlService (mixins, config) {
  return {
    execute (...methods) {
      if (methods.length > 0) {
        let time = methods.pop()
        if (time === -1) time = 0
        execute(config, methods, mixins, time * 60 * 1000)
      }
    },
    agendar (...methods) {
      if (methods.length > 0) {
        let time = methods.pop()
        if (typeof time !== 'string' && time.length !== 5) time = '00:00'
        agendar(config, methods, mixins, time)
      }
    }
  }
}
