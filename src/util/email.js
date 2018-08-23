import { createTransport } from 'nodemailer'

export class EmailSender {
  constructor (host, port, auth) {
    this.connection = {}
    this.connection.host = host
    this.connection.port = port
    this.connection.auth = auth
    this.connection.secure = true
  }

  notSecure () {
    this.connection.secure = false
  }

  ignoreCert () {
    this.connection.tls = { rejectUnauthorized: false }
  }

  enviaEmail (email) {
    return new Promise((resolve, reject) => {
      try {
        const contaEmail = createTransport(this.connection)
        contaEmail.sendMail(email, (err, info) => {
          if (err) return reject(err)
          return resolve(info)
        })
      } catch (e) {
        return reject(e)
      }
    })
  }
}
