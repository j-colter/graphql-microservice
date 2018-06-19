import { GSH } from '../index';

const UserType = GSH.modelRef('User');

export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    title: {
      type: DataTypes.STRING(64),
      unique: true,
      comment: 'title of the task'
    },
  });

  Task.associate = (models) => {
    Task.hasMany(models.UserTask, {
      foreignKey: {
        name: 'taskId',
        field: 'task_id'
      },
      // as: 'userTasks',
      hooks: true,
      onDelete: 'CASCADE'
    })
  };

  Task.config = {
    description: 'task info...'
  }

  Task.graphql = {
    queries: {
      oneUser: {
        description: 'one user...',
        deprecationReason: 'deprecationReason...',
        args: {
          id: {
            $type: UserType,
            required: true,
            description: 'user...'
          }
        },
        $type: UserType,
        resolve: async ({ id }, context, info) => {
          const { User } = context.models
          const user = await User.findById(id)
          return user
        }
      },
      allUsers: {
        $type: GSH.Connection.connectionType(UserType),
        args: {
          ...GSH.Connection.args,
          condition: {
            id: UserType
          }
        },
        description: 'all users...',
        resolve: async (args, context, info) => {
          const connection = context.modelTypes['UserConnection']
          const { Order } = context.models
          args.include = [
            {
              model: Order,
              required: true
            }
          ]
          return connection.resolve(null, args, context, info)
        }
      }
    },
  }

  return Task;
};
