import * as jwt from 'jwt-simple'

export function newToken (secret, duration, id) {
  let token
  let refresh
  let expira = new Date().getTime() + duration * 60 * 1000
  let inicia = expira - 5 * 60 * 1000
  token = jwt.encode({ id, expira }, secret)
  refresh = jwt.encode({ id, inicia }, secret)

  return { token, refresh, expira: new Date(expira) }
}

export function validaRefresh (secret, token) {
  if (!token) return false
  try {
    const decode = jwt.decode(token, secret)
    if (!decode.id) return false
    if (decode.inicia > new Date().getTime()) return false

    return decode
  } catch (e) {
    return false
  }
}

export function validaToken (secret, token) {
  if (!token) return false
  try {
    const decode = jwt.decode(token, secret)
    if (!decode.id) return false
    if (decode.expira <= new Date().getTime()) return false

    return decode
  } catch (e) {
    return false
  }
}
