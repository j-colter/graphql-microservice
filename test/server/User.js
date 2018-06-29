import { expect } from 'chai';
import _ from 'lodash';

import request from '../helpers/request';

describe('User server test', function () {
  const userId = 'VXNlcjox';
  describe('query one user', function () {
    it('should query a user', async () => {
      const data = {
        data: {
          user: {
            id: userId,
            phoneNumber: "18674083822",
            email: "18674083822@qq.com"
          }
        }
      }
      const query = `
        query {
          user(id: "${userId}") {
            id
            phoneNumber
            email
          }
        }
      `
      await request({query}, data)
    });
  });

  describe('update a user', function () {
    it('should update a user', async () => {
      const gender = parseInt(Math.random() * 10, 10) % 2
      const data = {
        data: {
          updateUser: {
            changedUser: {
              id: userId,
              gender
            }
          }
        }
      }
      const query = `
        mutation {
          updateUser(input: {
            id: "${userId}"
            values: {
              gender: ${gender}
            }
            clientMutationId: "123"
          }) {
            changedUser {
              id
              gender
            }
          }
        }
      `
      await request({query}, data)
    });
  });
});
