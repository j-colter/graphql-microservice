import defaults from 'defaults'
import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql'
import {
  resolver,
  relay
} from 'graphql-sequelize'
import _ from 'lodash'

import getModelTypes from './getModalTypes'
import getQueryAndMutation from './getQueryAndMutation'
import getSubscriptions from './subscription/subscriptions'

const { sequelizeConnection } = relay

const getSchema = (sequelize, schemaConfig) => {
  schemaConfig = defaults(schemaConfig, {
    models: (model) => (model),
    mutations: () => {},
    queries: () => {},
    subscriptions: () => {},
    schema: (schema) => (schema),
    resolver: resolver,
    sequelizeConnection: sequelizeConnection
  })
  const models = sequelize.models

  const modelTypes = schemaConfig.models(getModelTypes({models, schemaConfig}))

  const queries = {}
  const mutations = {}
  const subscriptions = {}

  for (let modelName in models) {
    const model = models[modelName]
    const modelQueryAndMutation = getQueryAndMutation({model, modelTypes, schemaConfig, models})
    for (let queryName in modelQueryAndMutation.queries) {
      queries[queryName] = modelQueryAndMutation.queries[queryName]
    }
    for (let mutationName in modelQueryAndMutation.mutations) {
      mutations[mutationName] = modelQueryAndMutation.mutations[mutationName]
    }

    // const subscriptionType = getSubscriptions({model, modelTypes, schemaConfig, models})
    for (let subscriptionName in modelQueryAndMutation.subscriptions) {
      subscriptions[subscriptionName] = modelQueryAndMutation.subscriptions[subscriptionName]
    }
  }
  const schema = {}

  if (!_.isEmpty(queries)) {
    const queryRoot = new GraphQLObjectType({
      name: 'Query',
      description: 'Root query of the Schema',
      fields: () => ({
        ...queries,
        // ...schemaConfig.queries({modelTypes})
      })
    })
    schema.query = queryRoot
  }

  if (!_.isEmpty(mutations)) {
    const mutationRoot = new GraphQLObjectType({
      name: 'Mutation',
      description: 'Root mutation of the Schema',
      fields: () => {
        return {
          ...mutations,
          // ...schemaConfig.mutations({modelTypes})
        }
      }
    })
    schema.mutation = mutationRoot
  }

  if (!_.isEmpty(subscriptions)) {
    const subscriptionRoot = new GraphQLObjectType({
      name: 'Subscription',
      description: 'Root subscription of the Schema',
      fields: () => {
        return {
          ...subscriptions,
          // ...schemaConfig.subscriptions({modelTypes})
        }
      }
    })
    schema.subscription = subscriptionRoot
  }

  return new GraphQLSchema(schemaConfig.schema(schema))
}

export default getSchema
