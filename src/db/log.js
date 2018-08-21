import { MongoClient } from 'mongodb'
import { getClientInfo, errorMessage } from '../util/request'

export function addErrorLog (config, error) {
  errorMessage(error)
  MongoClient.connect(config.mongo.url, { useNewUrlParser: true }, (err, client) => {
    if (!err) {
      const db = client.db(config.mongo.db)
      const errorLog = db.collection('errorlogs')
      errorLog.insert({
        message: JSON.stringify(error)
      })
      client.close()
    }
  })
}

export function addLog (config, req, result, data) {
  if (!config.log) return false

  req.agent = getClientInfo(req)
  MongoClient.connect(config.mongo.url, { useNewUrlParser: true }, (err, client) => {
    if (!err) {
      const db = client.db(config.mongo.db)
      const logs = db.collection('logs')
      data = data || {}
      logs.insert({
        createdAt: new Date(),
        url: req.originalUrl,
        result,
        request: JSON.parse(JSON.stringify({
          headers: req.headers,
          body: req.body,
          query: req.query,
          params: req.params,
          agent: req.agent
        })),
        response: JSON.parse(JSON.stringify(data))
      }, (err, result) => {
        if (err) throw err
      })
      client.close()
    }
  })
}

export function addServiceLog (config, result, data) {
  if (!config.log) return false

  MongoClient.connect(config.mongo.url, { useNewUrlParser: true }, (err, client) => {
    if (!err) {
      const db = client.db(config.mongo.db)
      const logs = db.collection('logs')
      data = data || {}
      logs.insert({
        createdAt: new Date(),
        result,
        response: JSON.parse(JSON.stringify(data))
      }, (err, result) => {
        if (err) throw err
      })
      client.close()
    }
  })
}

export function addDbLog (config, text) {
  if (config.log) {
    MongoClient.connect(config.mongo.url, { useNewUrlParser: true }, function (err, client) {
      if (!err) {
        const db = client.db(config.mongo.db)
        const logs = db.collection('mysqllogs')

        logs.insert({ createdAt: Date.now(), text })
        client.close()
      }
    })
  }
}
