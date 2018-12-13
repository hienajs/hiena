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

function defineAgenda (time, today) {
  let horario = new Date()
  horario.setHours(time.substr(0, time.indexOf(':')))
  horario.setMinutes(time.substr(time.indexOf(':') + 1))
  horario.setSeconds(0)
  if (!today) horario.setDate(horario.getDate() + 1)
  return horario.getTime() - new Date().getTime()
}

function agendar (config, methods, mixins, time, today = false) {
  let agendado = defineAgenda(time, today)
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
        agendar(config, methods, mixins, time, true)
      }
    }
  }
}
