import { addLog } from '../db/log'

async function compose (methods, req, res, mixins) {
  if (methods.length === 0) throw new Error('Nenhuma funcão localizada')
  let all = { req, res }
  let data = {}
  for (const x in methods) {
    all.models = methods[x].models
    all.config = methods[x].context.config
    all.thread = methods[x].context.thread
    all.cache = methods[x].context.cache
    all.params = methods[x].params
    all.mixins = mixins
    data = await methods[x].controller(all)
  }
  return data
}

async function expCompose (config, req, res, mixins, ...methods) {
  try {
    let data = await compose(methods, req, res, mixins)
    addLog(config, req, true, data)
    return res.status(200).json(data)
  } catch (err) {
    addLog(config, req, false, err.toString())
    return res.status(500).json({ message: err.message })
  }
}

async function composeDownload (config, req, res, mixins, ...methods) {
  try {
    let data = await compose(methods, req, res, mixins)
    if (!data.file) return res.status(500).json({ message: 'File is missing!' })
    if (!data.name) return res.status(500).json({ message: 'Name is missing!' })
    return res.download(data.file, data.name)
  } catch (err) {
    addLog(config, req, false, err.toString())
    return res.status(500).json({ message: err.message })
  }
}

async function composeContent (config, req, res, mixins, ...methods) {
  try {
    let data = await compose(methods, req, res, mixins)
    if (!data.content) return res.status(500).json({ message: 'Content is missing!' })
    res.contentType(data.content)
    if (!data.value) return res.status(500).json({ message: 'Value is missing!' })
    return res.send(data.value)
  } catch (err) {
    addLog(config, req, false, err.toString())
    return res.status(500).json({ message: err.message })
  }
}

export function rest (app, mixins, config) {
  return {
    get (path, ...methods) {
      app.get(path, async (req, res) => expCompose(config, req, res, mixins, ...methods))
    },
    getDownload (path, ...methods) {
      app.get(path, async (req, res) => composeDownload(config, req, res, mixins, ...methods))
    },
    getContent (path, ...methods) {
      app.get(path, async (req, res) => composeContent(config, req, res, mixins, ...methods))
    },
    post (path, ...methods) {
      app.post(path, async (req, res) => expCompose(config, req, res, mixins, ...methods))
    },
    put (path, ...methods) {
      app.put(path, async (req, res) => expCompose(config, req, res, mixins, ...methods))
    },
    delete (path, ...methods) {
      app.delete(path, async (req, res) => expCompose(config, req, res, mixins, ...methods))
    }
  }
}
