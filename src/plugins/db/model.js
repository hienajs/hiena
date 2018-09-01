import { DataTypes } from 'sequelize'
import { isDate } from '../../util/date'

const padraoFields = {
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}

export async function createTable (queryInterface, name, fields) {
  fields = Object.assign(fields, padraoFields)
  await queryInterface.createTable(name, fields)
  await queryInterface.addIndex(name, { name: `${name}_idx_padrao`, fields: ['active', 'createdAt', 'updatedAt'] })
}

export async function postgresAddIndex (con, transaction, table, name, field) {
  // Add Index
  return con.query(`
  CREATE INDEX ${name}
    ON ${table}
    USING btree
    (${field});
  `, { transaction })
}

export async function postgresCreateTable (con, transaction, name, string) {
  // Add Table
  await con.query(`
  CREATE TABLE ${name}
  (
    id SERIAL,
    ${string},
    active BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
  );
  `, { transaction })

  // Add Index
  await con.query(`
  CREATE INDEX ${name}_idx_padrao
    ON ${name}
    USING btree
    (active, "createdAt", "updatedAt");
  `, { transaction })
}

export function SequelizeModel (con, name, fields, options) {
  fields.active = padraoFields.active
  const definition = con.define(name, fields, options)

  // Global Methods
  definition.findQuery = async (query, order, options = {}) => {
    if (!query.page) query.page = 1
    if (!query.itensPorPagina) query.itensPorPagina = 10
    let limit = query.itensPorPagina
    let offset = (query.page * query.itensPorPagina) - query.itensPorPagina

    let where = query.where || {}
    if (query.All) {
      options = Object.assign({ where, order }, options)
    } else {
      options = Object.assign({ where, limit, offset, order }, options)
    }

    return definition.findAll(options)
  }

  definition.findActive = async (options) => {
    options.where = options.where || {}
    options.where.active = true
    return definition.findOne(options)
  }

  definition.findAllActive = async (options) => {
    options.where = options.where || {}
    options.where.active = true
    return definition.findAll(options)
  }

  definition.findWithValid = async function (where, options = {}) {
    options.where = where
    let reg = await definition.findOne(options)
    if (!reg) throw new Error('Registro não encontrado!')
    return reg
  }

  definition.list = async function (filter, order, options) {
    const list = await definition.findQuery(filter, order, options)
    const registros = await definition.count(filter)
    const pages = Math.ceil(registros / filter.itensPorPagina)
    return { registros, pages, list }
  }

  definition.edit = async function (where, dados, options = {}) {
    let reg = await definition.findWithValid(where)
    return reg.update(dados, options)
  }

  definition.del = async function (where) {
    let reg = await definition.findWithValid(where)
    return reg.destroy()
  }

  definition.prototype.newField = function (field, value, date = false) {
    if (typeof (value) === 'undefined' || value == null || value === '') return false
    if (typeof (this[field]) === 'undefined' || this[field] == null || this[field] === '') {
      if (date) value = isDate(value)
      this[field] = value
      return true
    }
    return false
  }

  definition.prototype.changeField = function (field, value, date = false) {
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

  return definition
}
