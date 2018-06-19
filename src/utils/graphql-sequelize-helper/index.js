import getSchema from './getSchema';
import getModelTypes from './getModalTypes';
import getQueryAndMutation from './getQueryAndMutation';
import ModelRef from './ModelRef';
import Connection from './Connection';

export default {
  getSchema,
  getModelTypes,
  getQueryAndMutation,
  modelRef: function modelRef(name) {
    return new ModelRef(name);
  },
  Connection,
}
