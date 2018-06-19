import { expect } from 'chai'
import _ from 'lodash'

import initSequelize from '../helpers/initSequelize'

describe('User', function () {
  let models = null
  let User = null
  let user = null
  const phoneNumber = '18674083822'
  const deletePhone = '13872200843'
  const deleteWhere = {
    phoneNumber: deletePhone
  }
  const where = {
    phoneNumber
  }
  const deleteData = {
    username: deletePhone,
    phoneNumber: deletePhone,
    email: `${deletePhone}@qq.com`,
  }
  const data = {
    username: phoneNumber,
    phoneNumber,
    email: `${phoneNumber}@qq.com`,
  }

  before(async () => {
    models = await initSequelize()
    User = models.User
    user = await User.findOne({where})
    if (user === null) {
      user = await User.create({...data, password: 'A1234567890'})
    }
  })

  describe('Create User', function () {
    it('should create a user', async () => {
      _.assign(deleteData, {
        password: "A123456"
      })

      await User.create(deleteData)
    });
  });

  describe('Delete user', function () {
    it('should should delete a user', async () => {
      const user = await User.findOne({where: deleteWhere})
      expect(user).to.exist
      await user.destroy()
    });
  });

  describe('Update a uer', function () {
    it('should update a user', async () => {
      const data = {
        gender: parseInt(Math.random() * 10, 10) % 3
      }
      // const user = await User.findOne({where})
      if (user) {
        await user.update(data)
        expect(user.gender).to.be.equal(data.gender)
      }
    });
  });

  describe('Query a user', function () {
    it('should query a user', async () => {
      // const attributes = ['username', 'phoneNumber', 'email']
      // const user = await User.findOne({where, attributes})
      expect(user.dataValues).to.deep.include(data)
    });
  });
});
