export default {
  env: 'development',
  dirname: __dirname,
  numProcess: 1,
  db: {
    dialect: 'mysql',
    url: null,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 30000,
      evict: 30000
    }
  },
  mongo: {
    url: null,
    db: null
  },
  log: false,
  showSql: false,
  server: {
    timeout: 1000 * 60 * 10,
    morgan: true,
    port: 3000
  },
  socket: {
    enable: false,
    redis: {
      host: '127.0.0.1',
      port: 6379
    }
  },
  cache: {
    enable: false,
    time: 0.2,
    redis: {
      host: '127.0.0.1',
      port: 6379
    }
  }
}
