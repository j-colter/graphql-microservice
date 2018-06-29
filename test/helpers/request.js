import request from 'supertest';
import { stringify } from 'query-string';

import { PORT } from "../../src/config";

const urlString = (urlParams) => {
  var string = '/graphql'
  if (urlParams) {
    string += ('?' + stringify(urlParams))
  }
  return string
}

export default async (param, data) => {
  const url = `http://localhost:${PORT}`
  return request(url)
    .post('/graphql')
    .send(param)
    .expect(200, data)
}
