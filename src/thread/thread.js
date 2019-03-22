export default function (context, mixins) {
  process.on('message', async ({ module, mixin, params }) => {
    try {
      let data = await mixins[module][mixin](...params)
      process.send({ error: false, data })
    } catch (data) {
      process.send({ error: true, data })
    }
  })

  console.log(`Processo [${context.action}] iniciado PID#${process.pid}`)
}
