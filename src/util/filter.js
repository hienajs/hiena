export class Filter {
  constructor (queryParams) {
    this.where = {}
    this.page = 1
    this.All = false
    this.itensPorPagina = 10
    this.queryParams = queryParams || {} // seta o query params na classe

    // Verifica página
    if (this.queryParams.page) {
      let page = parseInt(this.queryParams.page, 10)
      this.page = page || 1
    }
    // Verifica itens por pagina
    if (this.queryParams.qtd) {
      let qtd = parseInt(this.queryParams.qtd, 10)
      this.itensPorPagina = qtd || 10
    }
    // Verifica itens por pagina
    if (this.queryParams.all) {
      this.All = this.queryParams.all === '1'
    }
    // Chama os filtros padrões
    this.setActive()
    this.setCreated()
    this.setUpdated()
    this.setUsuario()
  }

  getQuery () {
    return { where: this.where, page: this.page, itensPorPagina: this.itensPorPagina, All: this.All }
  }

  setActive () {
    if (this.notEmptyParam('active')) {
      this.where.active = this.queryParams.active
    }
  }

  setCreated () {
    if (this.queryParams.createdAt) {
      const created = this.queryParams.createdAt
      if (created[0] && created[1]) {
        this.where.createdAt = this.between(this.setDate(created[0]), this.setDate(created[1]))
      } else if (created[0] && !created[1]) {
        this.where.createdAt = { $gte: this.setDate(created[0]) }
      } else if (!created[0] && created[1]) {
        this.where.createdAt = { $lte: this.setDate(created[1]) }
      }
    }
  }

  setUpdated () {
    if (this.queryParams.updatedAt) {
      const updated = this.queryParams.updatedAt
      if (updated[0] && updated[1]) {
        this.where.updated = this.between(this.setDate(updated[0]), (updated[1]))
      } else if (updated[0] && !updated[1]) {
        this.where.updated = { $gte: this.setDate(updated[0]) }
      } else if (!updated[0] && updated[1]) {
        this.where.updated = { $lte: this.setDate(updated[1]) }
      }
    }
  }

  setUsuario () {
    this.setSame('usuario_id')
  }

  setBool (field) {
    if (this.notEmptyParam(field)) {
      this.where[field] = this.queryParams[field]
    }
  }

  setSame (field) {
    if (this.queryParams[field]) {
      this.where[field] = this.queryParams[field]
    }
  }

  setLike (field) {
    if (this.queryParams[field]) {
      this.where[field] = this.like(this.queryParams[field])
    }
  }

  setLikeInitial (field) {
    if (this.queryParams[field]) {
      this.where[field] = this.like(this.queryParams[field], '')
    }
  }

  setILike (field) {
    if (this.queryParams[field]) {
      this.where[field] = this.iLike(this.queryParams[field])
    }
  }

  setILikeInitial (field) {
    if (this.queryParams[field]) {
      this.where[field] = this.iLike(this.queryParams[field], '')
    }
  }

  // Funções de apoio ===================
  like (valor, prefix = '%') {
    if (!valor) valor = ''
    valor = prefix + valor.replace(new RegExp(' ', 'g'), '%') + '%'
    return { $like: valor }
  }

  iLike (valor, prefix = '%') {
    if (!valor) valor = ''
    valor = prefix + valor.replace(new RegExp(' ', 'g'), '%') + '%'
    return { $iLike: valor }
  }

  between (valor1, valor2) {
    return { $between: [valor1, valor2] }
  }

  setDate (date) {
    let d = new Date(date)
    return d
  }

  notEmptyParam (field) {
    return (typeof (this.queryParams[field]) !== 'undefined' && this.queryParams[field] !== '' && this.queryParams[field] !== null)
  }
}
