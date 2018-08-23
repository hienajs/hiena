export function isEmptyArray (array, fields) {
  if (!array || array.length <= 0) throw new Error('Array não pode ser vazio!')
  for (let x in array) {
    const item = array[x]
    forIsEmpty(item, fields)
  }
}

export function forIsEmpty (dados, fields) {
  fields.forEach(item => {
    if (isEmpty(dados, item)) {
      throw new Error(`Campo ${item} não pode ser vazio!`)
    }
  })
}

export function IsEmail (email) {
  const expressao = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (expressao.test(email)) {
    return true
  } else {
    throw new Error('Email Inválido')
  }
}

export function isEmpty (dados, field) {
  if (typeof (dados) === 'undefined') return true
  if (typeof (dados[field]) === 'undefined') return true
  if (dados[field] == null || (dados[field] === '' && typeof (dados[field]) !== 'boolean')) return true

  return false
}

export function isCPF (cpf) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf === '' || cpf === null) throw new Error('CPF inválido!')
  if (cpf.length !== 11) throw new Error('CPF inválido!')
  // Valida 1º digito
  let add = 0
  let rev = 0

  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i)
  rev = 11 - (add % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(9))) throw new Error('CPF inválido!')

  // Valida 2º digito
  add = 0
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i)
  rev = 11 - (add % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(10))) throw new Error('CPF inválido!')

  // Caso passe em tudo
  return cpf
}

export function isBeneficio (beneficio) {
  if (beneficio === '' || beneficio === null) throw new Error('Beneficio inválido!')
  if (beneficio.length !== 10 ||
      beneficio === '0000000000' ||
      beneficio === '1111111111' ||
      beneficio === '2222222222' ||
      beneficio === '3333333333' ||
      beneficio === '4444444444' ||
      beneficio === '5555555555' ||
      beneficio === '6666666666' ||
      beneficio === '7777777777' ||
      beneficio === '8888888888' ||
      beneficio === '9999999999') throw new Error('Beneficio inválido!')

  // Caso passe em tudo
  return true
}

export function notMask (dado) {
  return dado.replace(/[^\d]+/g, '').replace('\\(', '').replace('\\)', '')
}

export function isNotMask (dados, fields) {
  fields.forEach(item => {
    if (dados[item]) dados[item] = notMask(dados[item])
  })
  return dados
}

export function isNotMaskArray (array, fields) {
  if (!array || array.length <= 0) return array
  if (!fields || fields.length <= 0) return array
  array.forEach((e, idx) => {
    array[idx] = isNotMask(e, fields)
  })
  return array
}

export function toFloat (number) {
  if (typeof number !== 'string') return parseFloat(number)
  else {
    if (number.includes('.') && number.includes(',')) {
      return parseFloat(number.split('.').join('').split(',').join('.'))
    }
    return parseFloat(number.split(',').join('.'))
  }
}

export function tirarAcento (value) {
  if (value) {
    value = value.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a')
    value = value.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e')
    value = value.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i')
    value = value.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o')
    value = value.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u')
    value = value.replace(new RegExp('[Ç]', 'gi'), 'c')
    return value
  }
  return value
}

export function cutName (value) {
  return value.split(' ')[0]
}

export async function existe (table, where, id = false, active = false) {
  if (active) where.active = true
  if (id) where.id = { $ne: parseInt(id) }
  let contador = await table.count({ where })
  if (contador) throw new Error('Esse registro já está cadastrado em nosso sistema!')
}
