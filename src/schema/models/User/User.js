import bcrypt from 'bcrypt';
import { withFilter } from 'graphql-subscriptions';

import { GSH, pubSub } from '../index';

const NEW_USER_MESSAGE = 'NEW_USER_MESSAGE';

const UserType = GSH.modelRef('User');
const OrderType = GSH.modelRef('Order');

export default (sequelize, DataTypes) => {
  const statusArr = ['active', 'pending', 'deleted']
  const User = sequelize.define('User', {
      username: {
        type: DataTypes.STRING(25),
        unique: true,
        comment: 'name of the user...',
        validate: {
          isAlphanumeric: {
            args: true,
            msg: 'The username can only contain letters and numbers',
          },
          len: {
            args: [3, 25],
            msg: 'The username needs to be between 3 and 25 characters long',
          },
        },
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING(25),
        field: 'phone_number',  // 数据库表字段
        unique: true,
        validate: {
          len: {
            args: [11],
            msg: 'The phoneNumber needs to be 11 characters long',
          },
        },
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(64),
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: 'Invalid email',
          },
        },
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [5, 100],
            msg: 'The password needs to be between 5 and 100 characters long',
          },
          // 自定义字段验证
          startWithLetter: (value) => {
            if(/^[a-z, A-A]/.test(value) === false) throw new Error('password must start with a letter')
          }
        },
      },
      gender: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: '1: 男 2: 女 3: 未知',
      },
      status: {
        type: DataTypes.ENUM,
        values: statusArr,
        defaultValue: statusArr[0],
        comment: 'status...'
      }
    }, {
      hooks: {
        afterValidate: async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 12);
          // eslint-disable-next-line no-param-reassign
          user.password = hashedPassword;
        },
        afterCreate: async (info) => {
          // 广播创建user事件
          pubSub.publish(NEW_USER_MESSAGE, {
            info
          })
        }
      },
    },
  );

  User.associate = (models) => {
    User.hasMany(models.UserTask, {
      foreignKey: {
        name: 'userId',     // graphql层显示
        field: 'user_id'    // 数据库表字段显示
      },
      // as: 'userTasks',
      hooks: true,          // 是否出发hooks事件
      onDelete: 'CASCADE'   // 删除时关联删除子元素
    })
    User.hasMany(models.Order, {
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      // as: 'orders',
      hooks: true,
      onDelete: 'CASCADE'
    })
  };

  User.config = {
    description: 'user info...'   // graphql层显示
  }

  User.graphql = {
    statics: {
      classLevelMethod: async (args) => {
        console.log('args...', args)
      }
    },
    methods: {
      instanceLevelMethod: async function (title) {
        console.log('this', this)
        console.log('title', title)
      }
    },
    mutations: {
      updateUserCus: {
        description: 'set the password',
        inputFields: {
          id: UserType,
          password: {
            $type: String,
            required: true,
            description: 'password...'
          },
          status: {
            $type: String,
            enumValues: statusArr,
            description: 'change status...'
          }
        },
        outputFields: {
          changedUser: UserType
        },
        mutateAndGetPayload: async (args, context, info) => {
          const { User } = context.models
          const user = await User.findById(args.id)
          if (user === null) throw new Error('用户不存在')
          delete args.id

          if (user) {
            await user.update(args)
          }

          return {
            changedUser: user
          }
        }
      },
      setName: {
        description: 'set the name',
        deprecationReason: 'upgrade to updateUserCus',  // 版本更新
        inputFields: {
          id: {
            $type: UserType
          },
          username: {
            $type: String,
            description: 'username...'
          },
          gender: Number
        },
        outputFields: {
          changedUser: UserType
        },
        mutateAndGetPayload: async (args, context) => {
          const {id, username} = args
          const { User, Task } = context.models
          const user = await User.findById(id)
          if (user) {
            await user.update({username})
          }

          const task = await Task.findById(1)
          await task.update({title: username})
          if (username === 'aassdd') throw new Error('error ....')

          return {
            changedUser: user
          }
        }
      },
    },
    queries: {
      userStatus: {
        description: 'user status....',
        args: {},
        $type: {
          status: JSON,
          code: Number
        },
        resolve: async () => {
          return {
            status: {
              data: statusArr
            },
            code: 123
          }
        }
      }
    },
    subscriptions: {
      createUser: {
        description: 'subscript on create user',
        $type: UserType,
        args: {
          name: String
        },
        resolve: payload => payload.info,
        subscribe: withFilter(
          () => pubSub.asyncIterator(NEW_USER_MESSAGE),
          (payload, variables) => variables.name === 'test',
        ),
      },
    },
    links: {
      order: {
        $type: OrderType,
        resolve: async (root, args, context) => {
          const { Order } = context.models
          return Order.findOne()
        }
      }
    }
  }

  return User;
};
