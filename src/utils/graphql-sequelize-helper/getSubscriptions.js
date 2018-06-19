import _ from "lodash";

import * as utils from "./utils";
import { toGraphqlType } from "./transformer";

export default ({
                  model,
                  modelTypes,
                  schemaConfig,
                  models
                }) => {
  const modelConfig = utils.getModelGrapqhQLConfig(model)
  const result = {
    subscriptions: {}
  }
  // 自定义查询
  const subscriptions = _.get(modelConfig, 'subscriptions', null)
  if (subscriptions) {
    result.subscriptions = {
      ...result.subscriptions,
      ...toGraphqlType({obj: subscriptions, modelTypes, useRoot: true})
    }
  }
  return result
}
