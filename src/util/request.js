import uaParser from 'ua-parser-js'

export function errorMessage (err) {
  return { message: err.message }
}

export function trataResponse (res, prom) {
  prom
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(500).json(errorMessage(err))
    })
}

export function getClientInfo (req) {
  let { browser, engine, os, device } = uaParser(req.headers['user-agent'])
  let ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress
  device = device.model || 'Desktop'

  return {
    device,
    ip,
    browser_name: browser.name,
    browser_version: browser.version,
    engine_name: engine.name,
    engine_version: engine.version,
    os_name: os.name,
    os_version: os.version
  }
}
