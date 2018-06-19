export const dbConfig = {
  schema: 'graphql-sequelize',
  user: 'root',
  password: 'root',
  options: {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    define: {
      schema: 'base',
      schemaDelimiter: '_',
      underscored: true,
    },
  },
}

export const PORT = 3020
