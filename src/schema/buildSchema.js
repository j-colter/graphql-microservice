import { addMiddleware } from 'graphql-add-middleware';

import schemaHelper from '../utils/graphql-sequelize-helper';

export default (sequelize) => {
  const schema = schemaHelper.getSchema(sequelize);

  const addTransaction = async (root, args, context, info, next) =>
    sequelize.transaction(() => next())
  addMiddleware(schema, 'Mutation', addTransaction);

  // TODO: 增加其他中间件 eg：鉴权

  return schema;
}
