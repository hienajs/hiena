import { controller, mixin } from './functions'
import { rest } from './rest'
import { ctrlService } from './service'

export function createControllerAndMixins (context, models, modules) {
  let controllers = {}
  let mixins = {}
  Object.keys(context.modules).forEach(k => {
    controllers[k] = controller(context.modules[k].controller, k, context, models, modules)
    mixins[k] = mixin(context.modules[k].mixins, k, mixins, context, models, modules)
  })
  return { controllers, mixins }
}

export function startService (context, controllers, mixins) {
  const service = ctrlService(mixins, context.config)
  Object.keys(context.modules).forEach(k => {
    if (context.modules[k].services) {
      context.modules[k].services({
        service,
        controller: controllers[k],
        others: controllers
      })
    }
  })
}

export function startRoute (app, context, controllers, mixins) {
  // Seta Rest
  const route = rest(app, mixins, context.config)
  Object.keys(context.modules).forEach(k => {
    if (context.modules[k].rest) {
      context.modules[k].rest({
        route,
        controller: controllers[k],
        others: controllers
      })
    }
  })

  return app
}
