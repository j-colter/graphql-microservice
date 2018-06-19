export default (sequelize, DataTypes) => {
  const UserTask = sequelize.define('UserTask', {
    admin: {
      type: DataTypes.BOOLEAN,
      comment: 'is admin...',
      defaultValue: false,
    },
  });

  UserTask.associate = (models) => {
    UserTask.belongsTo(models.Task, {
      foreignKey: {
        name: 'taskId',
        field: 'task_id'
      },
      required: true
    })
    UserTask.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      },
      required: true
    })
  };

  UserTask.graphql = {
    crud: {
      add: {
        // one: false
      }
    }
  }

  return UserTask;
};
