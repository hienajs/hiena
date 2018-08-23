import { addLog } from '../db/log'

async function compose (methods, req, res, mixins) {
  if (methods.length === 0) throw new Error('Nenhuma funcão localizada')
  let all = { req, res }
  let data = {}
  for (const x in methods) {
    all.models = methods[x].models
    all.config = methods[x].context.config
    all.params = methods[x].params
    all.mixins = mixins
    data = await methods[x].controller(all)
  }
  return data
}

function expCompose (config, req, res, mixins, ...methods) {
  compose(methods, req, res, mixins)
    .then(data => {
      addLog(config, req, true, data)
      res.status(200).json(data)
    })
    .catch(err => {
      addLog(config, req, false, err.toString())
      res.status(500).json({ message: err.message })
    })
}

function composeDownload (config, req, res, mixins, ...methods) {
  compose(methods, req, res, mixins)
    .then(data => {
      if (!data.file) return res.status(500).json({ message: 'File is missing!' })
      if (!data.name) return res.status(500).json({ message: 'Name is missing!' })
      res.download(data.file, data.name)
    })
    .catch(err => {
      addLog(config, req, false, err.toString())
      res.status(500).json({ message: err.message })
    })
}

function composeContent (config, req, res, mixins, ...methods) {
  compose(methods, req, res, mixins)
    .then(data => {
      if (!data.content) return res.status(500).json({ message: 'Content is missing!' })
      res.contentType(data.content)
      if (!data.value) return res.status(500).json({ message: 'Value is missing!' })
      res.send(data.value)
    })
    .catch(err => {
      addLog(config, req, false, err.toString())
      res.status(500).json({ message: err.message })
    })
}

export function rest (app, mixins, config) {
  return {
    get (path, ...methods) {
      app.get(path, (req, res) => expCompose(config, req, res, mixins, ...methods))
    },
    getDownload (path, ...methods) {
      app.get(path, (req, res) => composeDownload(config, req, res, mixins, ...methods))
    },
    getContent (path, ...methods) {
      app.get(path, (req, res) => composeContent(config, req, res, mixins, ...methods))
    },
    post (path, ...methods) {
      app.post(path, (req, res) => expCompose(config, req, res, mixins, ...methods))
    },
    put (path, ...methods) {
      app.put(path, (req, res) => expCompose(config, req, res, mixins, ...methods))
    },
    delete (path, ...methods) {
      app.delete(path, (req, res) => expCompose(config, req, res, mixins, ...methods))
    }
  }
}
