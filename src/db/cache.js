import redis from 'redis'

function funcName (module, name, key) {
  return `ch-function-[${module}-${name}-${JSON.stringify(key)}]`
}

function modName (modulo) {
  return `ch-modulo-[${modulo}]`
}

function addKey (client, modulo, key) {
  return new Promise((resolve, reject) => {
    const mod = modName(modulo)
    client.get(mod, (err, value) => {
      if (err) return reject(new Error(err.message))
      value = value ? JSON.parse(value) : []
      value.push(key)
      client.set(mod, JSON.stringify(value))
      return resolve(true)
    })
  })
}

function delKey (client, modulo, key) {
  return new Promise((resolve, reject) => {
    const mod = modName(modulo)
    client.get(mod, (err, value) => {
      if (err) return reject(new Error(err.message))
      value = value ? JSON.parse(value) : []
      value.splice(value.indexOf(key), 1)
      client.set(mod, JSON.stringify(value))
      return resolve(true)
    })
  })
}

export class CacheControl {
  constructor (config, modulo, filhos = []) {
    this.modulo = modulo
    this.filhos = filhos
    this.client = redis.createClient({ host: config.cache.redis.host, port: config.cache.redis.port })
    this.time = config.cache.time
  }

  async usa (name, params, cb) {
    const res = await this.get(name, params)
    if (res) return res
    let retorno = await cb()
    this.set(name, params, retorno)
    return retorno
  }

  async clean () {
    await this.delFilhos()
    return this.delModulo()
  }

  get (name, key) {
    if (!name) throw new Error('nome obrigatorio')
    if (!key) throw new Error('chave obrigatoria')

    return new Promise((resolve, reject) => {
      key = funcName(this.modulo, name, key)
      this.client.get(key, (err, value) => {
        if (err) return reject(new Error(err.message))
        if (value) return resolve(JSON.parse(value))
        return resolve(false)
      })
    })
  }

  set (name, key, dados = null) {
    if (!name) throw new Error('nome obrigatorio')
    if (!key) throw new Error('chave obrigatorio')

    return new Promise((resolve, reject) => {
      key = funcName(this.modulo, name, key)
      this.client.set(key, JSON.stringify(dados), 'EX', this.time * 60 * 1000)
      // Seta na lista de chaves
      addKey(this.client, this.modulo, key)
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  del (name, key) {
    if (!name) throw new Error('nome obrigatorio')
    if (!key) throw new Error('chave obrigatorio')

    return new Promise((resolve, reject) => {
      key = funcName(this.modulo, name, key)
      this.client.del(key)
      // Remove linha de modulos
      delKey(this.client, this.modulo, key)
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
      return resolve(true)
    })
  }

  async delFilhos () {
    for (let x in this.filhos) {
      await this.filhos[x].clean()
    }
    return true
  }

  delModulo (modulo) {
    const mod = modName(this.modulo)
    return new Promise((resolve, reject) => {
      this.client.get(mod, (err, value) => {
        if (err) return reject(new Error(err.message))
        value = value ? JSON.parse(value) : []
        value.forEach((item) => this.client.del(item))
        this.client.del(mod)
      })
    })
  }
}

export const cleanCache = function (config) {
  return new Promise((resolve, reject) => {
    const client = redis.createClient({ host: config.cache.redis.host, port: config.cache.redis.port })
    client.flushdb((err) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}
