import { readdirSync, lstatSync, existsSync, unlink } from 'fs'
import multer from 'multer'
import { sync as createFolder } from 'mkdirp'
import { uniqueId } from './string'

export function cleanName (file) {
  file = file.split('/').pop()
  file = file.charAt(0).toUpperCase() + file.slice(1)
  return file.slice(0, -3)
}

export function isJs (file) {
  return (file.indexOf('.') !== 0 && (file.slice(-3) === '.js'))
}

export function getAllJs (dir) {
  let filesAll = []
  let files = readdirSync(dir)

  files.forEach(item => {
    let e = `${dir}/${item}`
    if (isJs(e)) return filesAll.push(e)
    if (existsSync(e) && lstatSync(e).isDirectory()) {
      return filesAll.push(...getAllJs(e))
    }
  })

  return filesAll
}

export function removeFile (file) {
  return new Promise((resolve, reject) => {
    unlink(file, (err) => {
      if (err) return reject(err)
      return resolve(true)
    })
  })
}

export function requireAllJS (dir, cb) {
  if (existsSync(dir) && lstatSync(dir).isDirectory()) {
    getAllJs(dir).forEach(cb)
  }
}

export class UploadControl {
  constructor (url, types, max) {
    this.config = { url, types, max }
    this.file = {}
    this.createStorage()
    this.createMulter()
  }

  storageDestination (req, file, cb) {
    if (!existsSync(this.config.url)) {
      createFolder(this.config.url)
    }
    return cb(null, this.config.url)
  }

  storageName (req, file, cb) {
    const regex = new RegExp(`\\.(${this.config.types})$`)
    if (!file.originalname.match(regex)) return cb(new Error('Tipo de arquivo não suportado!'))
    let name = file.originalname.split('.')
    this.file.type = `.${name.pop()}`
    this.file.name = name.join('.')
    cb(null, `${uniqueId(this.file.name)}${this.file.type}`)
  }

  createStorage () {
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => this.storageDestination(req, file, cb),
      filename: (req, file, cb) => this.storageName(req, file, cb)
    })
  }

  createMulter () {
    this.upload = multer({
      storage: this.storage,
      limits: { fileSize: (this.config.max * 1024 * 1024) }
    }).single('file')
  }

  send ({ req, res }) {
    return new Promise((resolve, reject) => {
      this.upload(req, res, (err, retorno) => {
        if (err) return reject(err)
        this.file.path = req.file.path
        this.file.size = req.file.size / 1024 / 1024
        return resolve(retorno)
      })
    })
  }
}
