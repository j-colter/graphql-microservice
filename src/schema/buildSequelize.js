import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import decamelize from 'decamelize';
// 这里使用cls-hooked代替cls是因为目前sequelize不支持native的async/await导致无法全局设置transaction
import { createNamespace } from "cls-hooked";

import { dbConfig } from '../config';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default async () => {
  let maxReconnects = 20;
  let connected = false;
  const ns = createNamespace('my-local-db-namespace');
  Sequelize.useCLS(ns);

  const sequelize = new Sequelize(dbConfig.schema, dbConfig.user, dbConfig.password, {
    ...dbConfig.options,
    operatorsAliases: Sequelize.Op,
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    // sync: {
    //   alter: true,
    // }
  });

  sequelize.beforeDefine((attributes, options) => {
    if (options) {
      // eslint-disable-next-line no-param-reassign
      options.tableName = decamelize(options.modelName);
    }
  });

  while (!connected && maxReconnects) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await sequelize.authenticate();
      connected = true;
    } catch (err) {
      console.log('reconnecting in 5 seconds');
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
      maxReconnects -= 1;
    }
  }

  if (!connected) {
    return null;
  }

  const listModels = (dir) => {
    const models = {}
    fs.readdirSync(dir)
      .filter(file => (file.indexOf(".") !== 0) && (file !== "index.js"))
      .map(file => {
        const fileDir = path.join(dir, file)
        const stats = fs.statSync(fileDir)
        if (stats.isFile()) {
          const model = sequelize["import"](fileDir);
          models[model.name] = model
        }
        if (stats.isDirectory()) {
          _.assign(models, listModels(fileDir))
        }
      })
    return models
  }

  const models = listModels(path.join(__dirname, 'models'))

  _.forOwn(models, (model) => {
    if ('associate' in model) {
      model.associate(models);
    }
  });

  models.sequelize = sequelize;
  models.Sequelize = Sequelize;
  models.op = Sequelize.Op;

  return models;
};
