import _ from 'lodash'

import * as utils from '../utils'
import { toGraphqlType } from '../transformer'

export default ({ model, modelTypes }) => {
  const modelConfig = utils.getModelGrapqhQLConfig(model)
  const result = {}
  // 自定义查询
  const subscriptions = _.get(modelConfig, 'subscriptions', null)
  if (subscriptions) {
    _.assign(result, toGraphqlType({obj: subscriptions, modelTypes, useRoot: true}))
    // result.subscriptions = {
    //   ...result.subscriptions,
    //   ...toGraphqlType({obj: subscriptions, modelTypes, useRoot: true})
    // }
  }
  return result
}
