import { isDate } from './date'

export function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

export function merge (target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        merge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return merge(target, ...sources)
}

export function clone (object) {
  return JSON.parse(JSON.stringify(object))
}

export function includeArray (e, ...array) {
  if (!array) array = []
  for (let x in array) if (e.includes(array[x])) return true
  return false
}

export class Entity {
  constructor (obj = {}) {
    obj = clone(obj)
    if (Array.isArray(obj)) throw new Error('É necessário ser uma entidade!')
    else {
      Object.keys(obj).forEach(i => {
        if (Array.isArray(obj[i])) {
          this[i] = []
          for (const x in obj[i]) {
            this[i][x] = new Entity(obj[i][x])
          }
        } else if (obj[i] && typeof obj[i] === 'object' && typeof obj[i].getMonth !== 'function') {
          this[i] = new Entity(obj[i])
        } else this[i] = obj[i]
      })
    }
  }

  newField (field, value, date = false) {
    if (typeof (value) === 'undefined' || value == null || value === '') return false
    if (typeof (this[field]) === 'undefined' || this[field] == null || this[field] === '') {
      if (date) value = isDate(value)
      this[field] = value
      return true
    }
    return false
  }

  changeField (field, value, date = false) {
    if (typeof (value) === 'undefined' || value == null || value === '') return false
    if (this.newField(field, value, date)) return true
    if (date) {
      this[field] = isDate(this[field])
      value = isDate(value)
      let fieldCmp = this[field].getTime()
      let valueCmp = value.getTime()
      if (fieldCmp === valueCmp) return false
    } else {
      if (typeof this[field] !== typeof value) {
        let fieldCmp = this[field].toString()
        let valueCmp = value.toString()
        if (fieldCmp === valueCmp) return false
      }
      if (this[field] === value) return false
    }
    this[field] = value
    return true
  }
}

export function newField (field, value, date = false) {
  if (typeof (value) === 'undefined' || value == null || value === '') return false
  if (typeof (field) === 'undefined' || field == null || field === '') {
    if (date) value = isDate(value)
    field = value
    return true
  }
  return false
}

export function changeField (field, value, date = false) {
  if (typeof (value) === 'undefined' || value == null || value === '') return false
  if (this.newField(field, value, date)) return true
  if (date) {
    field = isDate(field)
    value = isDate(value)
    let fieldCmp = field.getTime()
    let valueCmp = value.getTime()
    if (fieldCmp === valueCmp) return false
  } else {
    if (typeof field !== typeof value) {
      let fieldCmp = field.toString()
      let valueCmp = value.toString()
      if (fieldCmp === valueCmp) return false
    }
    if (field === value) return false
  }
  field = value
  return true
}
