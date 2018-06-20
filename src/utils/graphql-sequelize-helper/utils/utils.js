import camelcase from 'camelcase'
import defaults from 'defaults'
import pluralize from 'pluralize'
import { GraphQLNonNull } from 'graphql'
import _ from 'lodash'

import { StringHelper } from './index'
import _type from '../type/index'

export const getTableName = (model) => {
  return model.name
}

export const connectionNameForAssociation = (model, associationName) => {
  return StringHelper.toInitialUpperCase(camelcase(`${getTableName(model)}_to_${associationName}`))
}

export const getModelGrapqhQLConfig = (model) => {
  const config = defaults(model.graphql, {
    modelType: (modelType) => modelType,
    crud: {}
  })
  const defaultCrudEnable = _.isBoolean(config.crud.enable) ? config.crud.enable : true
  const defaultCrud = defaultCrudEnable ? (func) => func : false
  for (let crudType of ['add', 'read', 'update', 'delete']) {
    config.crud[crudType] = defaults(config.crud[crudType], {
      one: defaultCrud,
      all: defaultCrud
    })
    if (crudType !== 'read') {
      delete config.crud[crudType].all
    }
  }
  return config
}

export const getQueryName = (model, type, countType) => {
  if (type === 'read') {
    if (countType === 'all') {
      return camelcase(pluralize.plural(getTableName(model)))
    } else if (countType === 'one') {
      return camelcase(getTableName(model))
    }
  } else if (['add', 'update', 'delete'].indexOf(type) !== -1) {
    if (countType === 'all') {
      return camelcase(`${type}_${pluralize.plural(getTableName(model))}`)
    } else if (countType === 'one') {
      return camelcase(`${type}_${getTableName(model)}`)
    }
  }
  console.warn('Unknown query type: ', type)
  return camelcase(`${type}_${countType}_${getTableName(model)}`)
}

export const getQueryDescription = (model, type, countType) => {
  const tableName = getTableName(model)
  if (countType === 'all') {
    return `${type} ${countType} ${pluralize.plural(tableName)}.`
  } else if (countType === 'one') {
    return `${type} ${countType} ${tableName}.`
  } else {
    return `${type} ${countType} ${tableName}.`
  }
}

export const removePrimaryKeyOrAutoIncrement = (model, fields) => {
  for (let field in fields) {
    const attribute = model.rawAttributes[field]
    if (attribute.references) continue
    if (attribute._autoGenerated || attribute.autoIncrement) {
      delete fields[field]
    }
  }
}

export const convertFieldsToGlobalId = (model, fields, isUpdateFields = false) => {
  _.forOwn(model.associations, (value, key) => {
    if (['BelongsTo'].indexOf(value.associationType) !== -1) {
      let globalIdType = _type.GraphQLScalarTypes.globalIdInputType(value.target.name)
      const required = _.get(value, 'options.required', false)
      if (required === true && isUpdateFields === false) globalIdType = new GraphQLNonNull(globalIdType)

      fields[value.foreignKey] = {
        description: `ID for ${key}`,
        type: globalIdType
      }
    }
  })
}

export const connectionName = (model) => {
  return `${model.name}Connection`
}

export const lcFirst = (name) => {
  if (name) {
    name = camelcase(name)
  }
  return name
}