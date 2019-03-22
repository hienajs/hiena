import { fork } from 'child_process'
import path from 'path'

export default function (objects, options) {
  // Objetos
  let mixins = objects.mixins
  let context = objects.context

  // Cria processos
  let all = {}

  if (context.config.process === 'multiple') {
    if (options.process && options.process.length > 0) {
      options.process.forEach(proc => {
        if (proc !== context.action) {
          all[proc] = fork(path.resolve(context.config.dirname, context.config.main), [`action:${proc}`])
        }
      })
    }
  }

  function executaProcesso (processo, module, mixin, params) {
    return new Promise((resolve, reject) => {
      processo.send({ module, mixin, params })
      processo.on('message', ({ error, data }) => {
        if (error) return reject(data)
        else return resolve(data)
      })
    })
  }

  return async function (name, module, mixin, ...params) {
    if (module && mixin) {
      if (mixins[module] && mixins[module][mixin]) {
        if (all[name]) return executaProcesso(all[name], module, mixin, params)
        else return mixins[module][mixin](...params)
      } else throw new Error('Metodo não encontrado!')
    } else throw new Error('Metodo não encontrado!')
  }
}
