export function ErrorToJson (error) {
  let obj = {}
  Object.getOwnPropertyNames(error).forEach(el => {
    obj[el] = JSON.stringify(error[el])
  })
  return obj
}

export class CompleteError extends Error {
  constructor (message = '', extra = {}) {
    super(message)
    this.name = this.constructor.name
    this.message = this.message.replace('CompleteError: ', '').replace('Error: ', '')
    Error.captureStackTrace(this, this.constructor)
    this.extra = extra
  }

  toJson () {
    let obj = {}
    Object.getOwnPropertyNames(this).forEach(el => {
      obj[el] = JSON.stringify(this[el])
    })
    return obj
  }
}
