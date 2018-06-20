import {
  mutationWithClientMutationId
} from 'graphql-relay'
import {
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList
} from 'graphql'
import defaults from 'defaults'
import _ from 'lodash'

import * as utils from './utils'
import _type from './type'
import { attributesToFindOptions } from "./query";
import { toGraphQLInputFieldMap, toGraphQLFieldConfig, toAttributesFields, toGraphqlType } from './transformer'

export default ({
                  model,
                  modelTypes,
                  schemaConfig,
                  models
                }) => {
  const tableName = utils.getTableName(model)
  const lowerCaseTableName = utils.lcFirst(tableName)
  const modelType = modelTypes[tableName]
  const modelConfig = utils.getModelGrapqhQLConfig(model)

  const result = {
    queries: {
    },
    mutations: {
    }
  }
  const nameResolver = utils.getQueryName
  const descriptionResolver = utils.getQueryDescription
  let graphqlObj
  // query all
  const findFields = attributesToFindOptions.toWhereFields(model)

  if (modelConfig.crud.read.all) {
    const connectionName = utils.connectionName(model)
    const connection = modelTypes[connectionName]
    graphqlObj = modelConfig.crud.read.all({
      name: nameResolver(model, 'read', 'all'),
      description: descriptionResolver(model, 'read', 'all'),
      type: connection.connectionType,
      args: _.assign({}, {
        ...connection.connectionArgs,
        condition: findFields,
        groupBy: {
          type: new GraphQLList(GraphQLString)
        },
      }),
      resolve: connection.resolve
    })
    result.queries[graphqlObj.name] = graphqlObj
  }
  // query one
  if (modelConfig.crud.read.one) {
    graphqlObj = modelConfig.crud.read.one({
      name: nameResolver(model, 'read', 'one'),
      description: descriptionResolver(model, 'read', 'one'),
      type: modelType,
      args: {
        id: { type: _type.GraphQLScalarTypes.globalIdInputType(model.name) }
      },
      resolve: schemaConfig.resolver(model)
    })
    result.queries[graphqlObj.name] = graphqlObj
  }

  let defaultFields = toAttributesFields(model, defaults(modelConfig.fieldConfig, {
    commentToDescription: true
  }))
  const updatedFields = toAttributesFields(model, defaults(modelConfig.fieldConfig, {
    commentToDescription: true,
    allowNull: true
  }))

  utils.removePrimaryKeyOrAutoIncrement(model, defaultFields)
  utils.removePrimaryKeyOrAutoIncrement(model, updatedFields)
  utils.convertFieldsToGlobalId(model, defaultFields)
  utils.convertFieldsToGlobalId(model, updatedFields, true)

  const valuesFieldType = new GraphQLInputObjectType({
    name: `${tableName}DefaultAddValuesInput`,
    description: 'Values to add',
    fields: defaultFields
  })
  const updatedValuesFieldType = new GraphQLInputObjectType({
    name: `${tableName}DefaultUpdateValuesInput`,
    description: 'Values to update',
    fields: updatedFields
  })

  if (modelConfig.crud.add.one) {
    graphqlObj = modelConfig.crud.add.one({
      name: nameResolver(model, 'add', 'one'),
      description: descriptionResolver(model, 'add', 'one'),
      inputFields: () => {
        return {
          values: {
            type: GraphQLNonNull(valuesFieldType)
          }
        }
      },
      outputFields: () => {
        return {
          [lowerCaseTableName]: {
            type: modelType
          }
        }
      },
      mutateAndGetPayload: async (args) => {
        const instance = await model.create(args.values)
        return {
          [lowerCaseTableName]: instance
        }
      }
    })
    result.mutations[graphqlObj.name] = mutationWithClientMutationId(graphqlObj)
  }

  const changedModel = `changed${model.name}`
  if (modelConfig.crud.update.one) {
    graphqlObj = modelConfig.crud.update.one({
      name: nameResolver(model, 'update', 'one'),
      description: descriptionResolver(model, 'update', 'one'),
      inputFields: () => {
        return {
          id: { type: GraphQLNonNull(_type.GraphQLScalarTypes.globalIdInputType(model.name)) },
          values: {
            type: updatedValuesFieldType
          }
        }
      },
      outputFields: () => {
        return {
          [changedModel]: {
            type: modelType
          }
        }
      },
      mutateAndGetPayload: async (args) => {
        let instance = await model.findById(args.id)
        await instance.update(args.values)
        return {
          [changedModel]: instance
        }
      }
    })

    result.mutations[graphqlObj.name] = mutationWithClientMutationId(graphqlObj)
  }

  if (modelConfig.crud.delete.one) {
    graphqlObj = modelConfig.crud.delete.one({
      name: nameResolver(model, 'delete', 'one'),
      description: descriptionResolver(model, 'delete', 'one'),
      inputFields: () => {
        return {
          id: { type: _type.GraphQLScalarTypes.globalIdInputType(model.name) }
        }
      },
      outputFields: () => {
        return {
          ok: {
            type: GraphQLBoolean,
            description: 'operation status'
          }
        }
      },
      mutateAndGetPayload: async (args) => {
        let instance = await model.findById(args.id)
        await instance.destroy()
        return {
          ok: true
        }
      }
    })
    result.mutations[graphqlObj.name] = mutationWithClientMutationId(graphqlObj)
  }

  // 自定义的增删改
  const mutations = _.get(modelConfig, 'mutations', null)
  if (mutations) {
    _.forOwn(mutations, (value, key) => {
      const { inputFields, outputFields } = value
      value.name = key
      value.inputFields = toGraphQLInputFieldMap(key, inputFields)
      _.forOwn(outputFields, (fValue, fKey) => {
        outputFields[fKey] = toGraphQLFieldConfig(key, '', fValue, null, modelTypes)
      })

      result.mutations[key] = mutationWithClientMutationId(value)
    })
  }

  // 自定义查询
  const queries = _.get(modelConfig, 'queries', null)
  if (queries) {
    result.queries = {
      ...result.queries,
      ...toGraphqlType({obj: queries, modelTypes})
    }
  }

  // 绑定静态方法和实例方法
  const methods = _.get(modelConfig, 'methods', null)
  if (methods) {
    _.forOwn(methods, (value, key) => {
      model.prototype[key] = value
    })
  }
  const statics = _.get(modelConfig, 'statics', null)
  if (statics) {
    _.forOwn(statics, (value, key) => {
      model[key] = value
    })
  }

  return result
}
