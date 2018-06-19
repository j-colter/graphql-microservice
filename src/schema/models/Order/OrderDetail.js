import { GSH } from '../index'

export default (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define('OrderDetail', {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '商品名'
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '数量'
    },
    price: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: '单价'
    }
  }, {
    hooks: {}
  })

  OrderDetail.config = {
    description: ''
  }

  OrderDetail.associate = (models) => {
    OrderDetail.belongsTo(models.Order, {
      foreignKey: {
        name: 'orderId',
        field: 'order_id'
      }
    })
  }

  OrderDetail.graphql = {
    mutations: {},
    queries: {},
    statics: {},
    methods: {},
    links: {}
  }

  return OrderDetail
}
