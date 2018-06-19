import { withFilter } from 'graphql-subscriptions'
import moment from 'moment'

import { GSH, pubSub } from '../index'

const UserType = GSH.modelRef('User')
const OrderType = GSH.modelRef('Order')

const CREATE_ORDER = 'CREATEORDER'
export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    orderNumber: {
      type: DataTypes.STRING(32),
      comment: '订单号'
    },
    title: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '订单标题'
    },
    amount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: '订单金额'
    }
  }, {
    hooks: {
      beforeCreate: (info) => {
        info.orderNumber = `ALU${moment().format('YYYYMMDDHHmmss')}${parseInt(Math.random() * 1000, 10)}`
      },
      afterCreate: (info) => {
        pubSub.publish(CREATE_ORDER, {
          info
        })
      }
    }
  })

  Order.config = {
    description: 'order...'
  }

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      // as: 'user',
      required: true
    })
    Order.hasMany(models.OrderDetail, {
      foreignKey: {
        name: 'orderId',
        field: 'order_id'
      },
      // as: 'orderDetails',
      hooks: true,
      onDelete: 'CASCADE'
    })
  }

  Order.graphql = {
    mutations: {},
    queries: {},
    statics: {},
    methods: {},
    links: {
      status: {
        description: 'test links...',
        args: {
          type: {
            $type: String,
            description: 'test type'
          },
          userId: {
            $type: Number,
            description: 'userId...'
          }
        },
        $type: UserType,
        resolve: async (_, args, context) => {
          const { User } = context.models
          return User.findById(args.userId)
        }
      }
    },
    subscriptions: {
      createOrder: {
        description: '创建order监听事件',
        args: {
          userId: {
            $type: UserType,
            required: true
          }
        },
        $type: OrderType,
        resolve: payload => payload.info,
        subscribe: withFilter(
          () => pubSub.asyncIterator(CREATE_ORDER),
          (payload, variables) => payload.info.userId === variables.userId
        )
      }
    }
  }

  return Order
}
