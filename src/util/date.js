export function getTimezone () {
  let offset = new Date().getTimezoneOffset()
  let o = Math.abs(offset)
  return (
    (offset < 0 ? '+' : '-') +
    ('00' + Math.floor(o / 60)).slice(-2) +
    ':' +
    ('00' + o % 60).slice(-2)
  )
}

export function stringToTime (date = new Date()) {
  date = typeof date === 'string' ? date = new Date(date) : date
  let time = new Date(date).getTime()
  return time
}

export function stringDate (valor) {
  if (!valor) return null
  if (typeof valor !== 'string' && typeof valor !== 'number') return valor
  valor = `${valor}`
  // Data com hora com /
  if (valor.includes(':') && valor.includes('/')) {
    let from = valor.split(' ')
    let data = from[0].split('/')
    if (data.length === 2) {
      data = ['01', data[0], data[1]]
    }
    let hora = from[1].split(':')
    return new Date(parseInt(data[2]), parseInt(data[1]) - 1, parseInt(data[0]), parseInt(hora[0]), parseInt(hora[1]))
  }
  // Data sem hora com /
  if (valor.includes('/')) {
    let from = valor.split('/')
    if (from.length === 2) {
      from = ['01', from[0], from[1]]
    }
    return new Date(parseInt(from[2]), parseInt(from[1]) - 1, parseInt(from[0]))
  }

  // Data com hora com -
  if (valor.includes(':') && valor.includes('/')) {
    let from = valor.split(' ')
    let data = from[0].split('-')
    if (data.length === 2) {
      data = [data[1], data[0], '01']
    }
    let hora = from[1].split(':')
    return new Date(parseInt(data[0]), parseInt(data[1]) - 1, parseInt(data[2]), parseInt(hora[0]), parseInt(hora[1]))
  }
  // Data sem hora com -
  if (valor.includes('/')) {
    let from = valor.split('/')
    if (from.length === 2) {
      from = [from[1], from[0], '01']
    }
    return new Date(parseInt(from[0]), parseInt(from[1]) - 1, parseInt(from[2]))
  }

  // Data continua
  if (valor.length === 6) {
    let ano = `${valor[0]}${valor[1]}${valor[2]}${valor[3]}`
    let mes = `${valor[4]}${valor[5]}`
    let dia = `01`
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
  }

  if (valor.length === 8) {
    let ano = `${valor[0]}${valor[1]}${valor[2]}${valor[3]}`
    let mes = `${valor[4]}${valor[5]}`
    let dia = `${valor[6]}${valor[7]}`
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
  }

  return new Date(valor)
}

export function convertToUTCDate (date = Date.now(), toUTC = false) {
  date = new Date(date)
  const localOffset = date.getTimezoneOffset() * 60000
  const localTime = date.getTime()
  if (toUTC) {
    date = localTime + localOffset
  } else {
    date = localTime - localOffset
  }
  // date = localTime
  date = new Date(date)
  return date
}

export function dateString (data = new Date()) {
  data = typeof data === 'string' ? data = new Date(data) : data
  data = convertToUTCDate(data, true)
  let dia = data.getDate()
  if (dia.toString().length === 1) dia = `0${dia}`
  let mes = data.getMonth() + 1
  if (mes.toString().length === 1) mes = `0${mes}`
  let ano = data.getFullYear()

  return `${dia}/${mes}/${ano}`
}

export function onlyDate (data = new Date()) {
  data = typeof data === 'string' ? data = new Date(data) : data
  data = convertToUTCDate(data, true)
  let dia = data.getDate()
  if (dia.toString().length === 1) dia = `0${dia}`
  let mes = data.getMonth()
  if (mes.toString().length === 1) mes = `0${mes}`
  let ano = data.getFullYear()

  return new Date(ano, mes, dia, 0, 0, 0, 0)
}

export function mesString (data = new Date()) {
  data = typeof data === 'string' ? data = new Date(data) : data
  data = convertToUTCDate(data, true)
  let mes = data.getMonth() + 1
  if (mes.toString().length === 1) mes = `0${mes}`
  let ano = data.getFullYear()

  return `${mes}/${ano}`
}

export function monthDiff (d1, d2, include = false) {
  let months
  months = (d2.getFullYear() - d1.getFullYear()) * 12
  if (include) months -= d1.getMonth()
  else months -= d1.getMonth() + 1
  months += d2.getMonth() + 1
  return months <= 0 ? 0 : months
}

export function dayDiffTime (d1, d2) {
  if (!d1 || !d2) return 0
  return d1.getTime() - d2.getTime()
}

export function dayDiff (d1, d2) {
  if (!d1 || !d2) return 0
  return Math.floor(dayDiffTime(d1, d2) / (1000 * 3600 * 24))
}

export function addMonth (add, d = new Date()) {
  let newD = onlyDate(d)
  newD = typeof newD === 'string' ? newD = new Date(newD) : newD
  newD.setMonth(newD.getMonth() + add)
  return newD
}

export function isDate (data) {
  if (typeof (data) === 'undefined' || data == null || data === '') return data
  return typeof data === 'string' ? new Date(data) : data
}

export function noHours (date = new Date()) {
  if (!date) return null
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

export function idade (date = new Date()) {
  date = isDate(date)
  let d = new Date()
  let ano = d.getFullYear()
  let mes = d.getMonth() + 1
  let dia = d.getDate()

  let anoDate = date.getFullYear()
  let diaDate = date.getDate()
  let mesDate = date.getMonth() + 1
  let anos = ano - anoDate
  if (mes > mesDate || (mes === mesDate && diaDate < dia)) anos--
  return anos < 0 ? 0 : anos
}
