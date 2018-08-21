export async function patch (entitys, data, model, transaction, trata = (p) => p, field = 'id') {
  const retorno = []
  // Pega os para excluir
  for (const x in entitys) {
    const indice = data.findIndex((el) => {
      return el[field] === entitys[x][field]
    })
    if (indice === -1) {
      trata({}, entitys[x])
      await entitys[x].destroy({ transaction })
    }
  }
  for (const x in data) {
    let item = data[x]
    let indice = -1
    if (item[field]) indice = entitys.findIndex((el) => el[field] === item[field])
    // Add Or Update
    if (indice === -1) {
      item = trata(item, false)
      const reg = await model.create(item, { transaction })
      retorno.push(reg)
    } else {
      item = trata(item, false)
      const reg = await entitys[indice].update(item, { transaction })
      retorno.push(reg)
    }
  }

  return retorno
}

export async function patchAsync (entitys, data, model, transaction, trata = async (p) => p, field = 'id') {
  const retorno = []
  // Pega os para excluir
  for (const x in entitys) {
    const indice = data.findIndex((el) => el[field] === entitys[x][field])
    if (indice === -1) {
      await trata({}, entitys[x])
      await entitys[x].destroy({ transaction })
    }
  }
  for (const x in data) {
    let item = data[x]
    let indice = -1
    if (item[field]) indice = entitys.findIndex((el) => el[field] === item[field])

    // Add Or Update
    if (indice === -1) {
      item = await trata(item, false)
      const reg = await model.create(item, { transaction })
      retorno.push(reg)
    } else {
      item = await trata(item, false)
      const reg = await entitys[indice].update(item, { transaction })
      retorno.push(reg)
    }
  }

  return retorno
}
