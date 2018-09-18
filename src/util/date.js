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

export function isDate (data) {
  if (typeof (data) === 'undefined' || data == null || data === '') return data
  return typeof data === 'string' ? new Date(data) : data
}
