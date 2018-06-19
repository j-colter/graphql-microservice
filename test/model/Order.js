import { expect } from 'chai'

import { initSequelize, utils } from "../helpers"
const { randInt, randFloat } = utils

describe('Order', () => {
  let User, Order, OrderDetail, user, order
  const title = 'test order'

  before(async () => {
    const models = await initSequelize()
    User = models.User
    Order = models.Order
    OrderDetail = models.OrderDetail

    user = await User.findOne({where: { phoneNumber: '18674083822' }})
    order = await Order.findOne()
  })

  describe('Create', function () {
    it('should create an order and an orderDetail', async () => {
      const data = {
        title,
        amount: randInt(100),
        userId: user.id
      }
      const order = await Order.create(data)
      expect(order.dataValues).to.deep.include(data)

      // create OrderDetail
      const orderDetailData = {
        name: 'test goods',
        count: randInt(),
        price: randInt(66),
        orderId: order.id
      }
      const orderDetail = await OrderDetail.create(orderDetailData)
      expect(orderDetail.dataValues).to.deep.include(orderDetailData)
    });
  });

  describe('Delete', function () {
    it('should delete some orders and orderDetails', async () => {
      const where = { title }
      const res = await Order.destroy({
        where,
        individualHooks: true
      })
      expect(res).to.gte(1)
    });
  });

  describe('Update', function () {
    it('should update an order', async () => {
      const data = {
        amount: randFloat()
      }

      if (order) {
        order.amount = data.amount
        await order.save()

        expect(order.amount).to.equal(data.amount)
      }
    });
  });

  describe('Query', function () {
    it('should query an order', async () => {
      expect(order).to.be.exist
    });
  });
});
