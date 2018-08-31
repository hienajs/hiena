import md5 from 'blueimp-md5'

export function uniqueId (id = 0) {
  return md5(id + '_' + Math.random().toString(36).substr(2, 9))
}

export function removerAcentos (newStringComAcento) {
  let retorno = newStringComAcento
  const mapaAcentosHex = {
    a: /[\xE0-\xE6]/g,
    e: /[\xE8-\xEB]/g,
    i: /[\xEC-\xEF]/g,
    o: /[\xF2-\xF6]/g,
    u: /[\xF9-\xFC]/g,
    c: /\xE7/g,
    n: /\xF1/g
  }

  for (let letra in mapaAcentosHex) {
    const expressaoRegular = mapaAcentosHex[letra]
    retorno = retorno.replace(expressaoRegular, letra)
  }
  // Tira aspas duplas e aspas simples
  retorno = retorno.replace(/[\\"]/g, '')
  retorno = retorno.replace(/[\\']/g, '')
  return retorno
}

export function lower (value) {
  if (!value) return ''
  return value.toString().toLocaleLowerCase()
}

export function upper (value) {
  if (!value) return null
  return value.toString().toUpperCase()
}

export function capitalize (value) {
  if (!value) return ''
  let array = value.toString().toLocaleLowerCase().split(' ')
  array = array.map(e => e.charAt(0).toUpperCase() + e.slice(1))
  return array.join(' ')
}

export function capitalizeFunc (value) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function tiraSpace (value) {
  if (!value) return null
  value = value.split('   ')
  return value[0]
}

export function tiraMascara (valor) {
  if (!valor) return ''
  return valor.replace(/[^\d]+/g, '')
}

export function mascaraCPF (cpf) {
  if (!cpf) return cpf
  cpf = cpf.replace(/\D/g, '')
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  return cpf
}

export function cpfCompleto (cpf) {
  return (`00000000000${cpf}`).slice(-11)
}

export function inssCompleto (inss) {
  return (`0000000000${inss}`).slice(-10)
}

export function mascaraBeneficio (cpf) {
  if (!cpf) return cpf
  cpf = cpf.replace(/\D/g, '')
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  return cpf
}

export function real (numero = 0.00) {
  numero = numero.toFixed(2).split('.')
  numero[0] = 'R$ ' + numero[0].split(/(?=(?:...)*$)/).join('.')
  return numero.join(',')
}

export function utf8Encode (s) {
  try {
    return decodeURIComponent(escape(s))
  } catch (e) {
    return s
  }
}

export function quebra (string, pointer, pos) {
  let array = string.split(pointer)
  return array[pos]
}

export function intervalo (string, inicio, final) {
  return quebra(quebra(string, inicio, 1), final, 0)
}

export function intervaloArray (string, ...array) {
  let result = string
  for (let x in array) {
    result = intervalo(result, array[x][0], array[x][1])
  }
  return result
}

export function forEachString (string, inicio, fim, cb) {
  let spl = string.split(inicio)
  for (let x in spl) {
    if (x > 0) {
      const str = spl[x].split(fim)[0].trim()
      cb(str)
    }
  }
}
