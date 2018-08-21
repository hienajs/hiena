import { DataTypes, fn as sequelizeFn, col as sequelizeCol } from 'sequelize'

async function defineSequelizeMeta (con) {
  const meta = con.define('SequelizeMeta', {
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'sequelizemeta'
  })
  await meta.sync()
  return meta
}

async function defineMongoScript (con) {
  const meta = con.define('SequelizeScript', {
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'sequelizescript'
  })
  await meta.sync()
  return meta
}

function validaMigration (el) {
  if (!el.name) throw new Error('Propriedade name faltando!')
  if (!el.up) throw new Error('Propriedade up faltando!')
  return el
}

function validaScript (el) {
  if (!el.name) throw new Error('Propriedade name faltando!')
  if (!el.up) throw new Error('Propriedade up faltando!')
  return el
}

function validaSeed (el) {
  if (!el.model) throw new Error('Propriedade model faltando!')
  if (!el.dados) throw new Error('Propriedade dados faltando!')
  return el
}

export class ExecuteControl {
  constructor (con, dialect = 'postgres') {
    this.con = con
    this.dialect = dialect
    this.executeMigration = false
    this.executeScript = false
    this.registroMigrations = []
    this.registroScripts = []
    this.migrations = []
    this.seeds = []
    this.scripts = []
    this.sequences = []
    this.db = null
    this.transaction = false
  }

  async getMigrations () {
    if (this.executeMigration) return this.registroMigrations
    this.registroMigrations = await this.modelMigration.findAll({ transaction: this.transaction })
    this.executeMigration = true
    return this.registroMigrations
  }

  setRegistroMigration (migration) {
    this.registroMigrations.push({ name: migration.name })
    return this.modelMigration.create({ name: migration.name }, { transaction: this.transaction })
  }

  setMigration (...migrations) {
    migrations.map(validaMigration)
    this.migrations = migrations
  }

  async trataMigration (migration) {
    const encontrado = this.registroMigrations.find(el => el.name === migration.name)
    if (encontrado) return true
    try {
      console.log('Executando a migration:', migration.name)
      await migration.up({
        queryInterface: this.con.getQueryInterface(),
        con: this.con,
        transaction: this.transaction
      })
      await this.setRegistroMigration(migration)
    } catch (e) {
      console.error('Erro na migration:', migration.name)
      console.error(e)
      throw new Error(e)
    }
  }

  async execMigration () {
    this.modelMigration = await defineSequelizeMeta(this.con)
    try {
      await this.getMigrations()
      console.log('>>> Iniciando verificação das migrations')
      for (const x in this.migrations) {
        await this.trataMigration(this.migrations[x])
      }
      console.log('>>> Migrations executadas')
    } catch (e) {
      console.log('>>> Erro ao executar as migrations')
      throw e
    }
  }

  setSeed (...seeds) {
    seeds.map(validaSeed)
    this.seeds = seeds
  }

  async getSeed (seed) {
    // Pega os dados já salvos no banco
    let $in = seed.dados.map(i => i[seed.field])
    let where = {}
    where[seed.field] = { $in }
    let list = await this.db[seed.model].findAll({ where, transaction: this.transaction })
    list = list.map(i => i[seed.field])
    return list
  }

  async getSeedKeep (seed) {
    // Pega os dados já salvos no banco
    let list = await this.db[seed.model].findAll({ where: { $or: seed.dados }, transaction: this.transaction })
    return list
  }

  async execSeed (cb) {
    try {
      console.log('>>> Iniciando verificação dos seeds')
      for (let x in this.seeds) {
        let adicionado = false
        // Verifica se a dados a adicionar
        let seed = this.seeds[x]
        if (seed.dados.length === 0) continue
        console.log('Verificando o seed:', seed.model)
        if (seed.keep) {
          // Percorre os dados e insere
          let list = await this.getSeedKeep(seed)
          for (let y in seed.dados) {
            let item = seed.dados[y]
            let indice = list.findIndex(itemSalvo => {
              let campos = Object.keys(item)
              for (let c in campos) {
                let campo = campos[c]
                if (itemSalvo[campo] !== item[campo]) return false
              }
              return true
            })
            if (indice === -1) {
              adicionado = true
              await this.db[seed.model].create(item, { transaction: this.transaction })
            }
          }
        } else {
          // Pega os dados já salvos no banco
          let list = await this.getSeed(seed)

          // Percorre os dados e insere
          for (let y in seed.dados) {
            let item = seed.dados[y]
            if (list.indexOf(item[seed.field]) === -1) {
              adicionado = true
              await this.db[seed.model].create(item, { transaction: this.transaction })
            }
          }
        }
        if (adicionado && this.dialect === 'postgres') {
          let busca = await this.db[seed.model].findOne({
            attributes: [[sequelizeFn('max', sequelizeCol('id')), 'id']],
            transaction: this.transaction
          })
          let tabela = this.db[seed.model].getTableName()
          this.sequences.push({
            name: `${tabela}_id_seq`,
            val: `${busca.id}`
          })
        }
      }
      console.log('>>> Scripts executados')
    } catch (e) {
      console.log('>>> Erro ao executar os seeds')
      console.error(e)
      throw e
    }
  }

  async getScripts () {
    if (this.executeScript) return this.registroScripts
    this.registroScripts = await this.modelScript.findAll({ transaction: this.transaction })
    this.executeScript = true
    return this.registroScripts
  }

  setRegistroScript (script) {
    this.registroScripts.push({ name: script.name }, { transaction: this.transaction })
    return this.modelScript.create({ name: script.name }, { transaction: this.transaction })
  }

  setScript (...scripts) {
    scripts.map(validaScript)
    this.scripts = scripts
  }

  async trataScript (script) {
    const encontrado = this.registroScripts.find(el => el.name === script.name)
    if (encontrado) return true
    try {
      console.log('Executando o script:', script.name)
      await script.up({
        db: this.db,
        transaction: this.transaction
      })
      await this.setRegistroScript(script)
    } catch (e) {
      console.error('Erro na script:', script.name)
      console.error(e)
      throw new Error(e)
    }
  }

  async execScript () {
    this.modelScript = await defineMongoScript(this.con)
    try {
      await this.getScripts()
      console.log('>>> Iniciando verificação dos scripts')
      for (const x in this.scripts) {
        await this.trataScript(this.scripts[x])
      }
      console.log('>>> Scripts executados')
      return this.registroScripts
    } catch (e) {
      console.log('>>> Erro ao executar os scripts')
      throw e
    }
  }

  setItens (migrations, seeds, scripts, models) {
    // Executa Todos
    this.setMigration(...migrations)
    this.setSeed(...seeds)
    this.setScript(...scripts)
    this.db = models
  }

  async trataSequences () {
    console.log('>>> Iniciando verificação das sequences')
    if (this.sequences.length > 0) {
      for (let x in this.sequences) {
        let e = this.sequences[x]
        if (e.name && e.val) {
          console.log('Mudando a sequence:', e.name)
          await this.con.query(`SELECT setval('${e.name}', ${e.val});`)
        }
      }
    }
    console.log('>>> Sequences executadas')
  }

  async exec () {
    this.transaction = await this.con.transaction()
    try {
      await this.execMigration() // Migration
      await this.execSeed() // Seed
      await this.execScript() // Script
      // Commit
      await this.transaction.commit()
      await this.trataSequences()
      this.transaction = false
    } catch (e) {
      await this.transaction.rollback()
      this.transaction = false
      throw e
    }
  }
}
