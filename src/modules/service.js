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

async function executeOne (config, methods, mixins, comp = false) {
  try {
    let data = await compose(methods, mixins)
    addServiceLog(config, true, data)
    if (comp) return data
    else return true
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

function setHour (time) {
  let horario = new Date()
  horario.setHours(time.substr(0, time.indexOf(':')))
  horario.setMinutes(time.substr(time.indexOf(':') + 1))
  horario.setSeconds(0)
  return horario
}

function defineAgenda (time, today) {
  let horario = setHour(time)
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

function permiteHorario (time) {
  let inicio = setHour(time[0])
  let fim = setHour(time[1])
  let agora = new Date()
  agora.setSeconds(0)
  if (inicio > fim) fim.setDate(fim.getDate() + 1)
  return agora >= inicio && agora <= fim
}

async function executeRestrito (config, methods, mixins, time) {
  if (permiteHorario(time)) {
    const retorno = await executeOne(config, methods, mixins, true)
    if (retorno === true) executeRestrito(config, methods, mixins, time)
    else restrito(config, methods, mixins, time)
  } else restrito(config, methods, mixins, time)
}

async function restrito (config, methods, mixins, time, today = false) {
  setTimeout(() => {
    executeRestrito(config, methods, mixins, time)
  }, defineAgenda(time[0], today))
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
    },
    restrito (...methods) {
      if (methods.length > 0) {
        let time = methods.pop()
        if (time.length !== 2) time = ['23:00', '08:00']
        restrito(config, methods, mixins, time, true)
      }
    }
  }
}
