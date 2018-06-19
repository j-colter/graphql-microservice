import { buildSequelize } from "../src/schema/index"
import utils from '../test/helpers/utils'

const { randInt, randFloat } = utils
const initUser = async (models) => {
  const { User, Order, OrderDetail } = models

  const phoneNumber = '18674083822'
  const user = await User.findOne({where: {phoneNumber}})
  if (user) return

  const data = {
    username: phoneNumber,
    phoneNumber,
    email: `${phoneNumber}@qq.com`,
    password: 'A123456',
    Orders: [
      {
        title: '测试订单1',
        amount: randInt(),
        OrderDetails: [
          {
            name: '测试商品1',
            count: randInt(),
            price: randFloat()
          }
        ]
      },
      {
        title: '测试订单2',
        amount: randInt(),
        OrderDetails: [
          {
            name: '测试商品2',
            count: randInt(),
            price: randFloat()
          }
        ]
      }
    ]
  }

  await User.create(data, {
    include: [
      {
        model: Order,
        include: [
          {
            model: OrderDetail,
          }
        ]
      }
    ]
  })
}

const init = async () => {
  const models = await buildSequelize()
  await models.sequelize.sync({force: true})
  await initUser(models)

  console.log('init ok!')
}

init()

