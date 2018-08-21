export function mixin (mx, modulo, mixins, context, models, modules) {
  let myModels = {
    con: models.con
  }
  if (modules[modulo]) {
    modules[modulo].models.forEach(e => {
      myModels[e] = models[e]
    })
  }

  let methods = {}
  if (mx) {
    Object.keys(mx).forEach(i => {
      methods[i] = function (...params) {
        let all = {
          models: myModels,
          config: context.config,
          mixins
        }
        return mx[i](all, ...params)
      }
    })
  }

  return methods
}

export function controller (ctrl, modulo, context, models, modules) {
  let methods = {}

  let myModels = {
    con: models.con
  }
  if (modules[modulo]) {
    modules[modulo].models.forEach(e => {
      myModels[e] = models[e]
    })
  }

  if (ctrl) {
    Object.keys(ctrl).forEach(m => {
      methods[m] = function (...params) {
        return {
          params,
          modulo,
          context,
          models: myModels,
          controller: ctrl[m]
        }
      }
    })
  }

  return methods
}
