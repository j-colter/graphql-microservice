import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import cors from 'cors';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { buildSequelize, buildSchema } from './schema';
import { PORT } from './config';
import pubSub from './pubsub';

const app = express();

app.use(bodyParser.json())
const server = createServer(app);

const graphqlEndpoint = '/graphql';
const graphiqlEndpoint = '/graphiql';
const subscriptionEndpoint = '/subscriptions';

buildSequelize().then((models) => {
  if (!models) {
    console.log('Could not connect to database');
    return;
  }

  const schema = buildSchema(models.sequelize);

  function parseCookies(request) {
    const list = {}
    const rc = request.headers.cookie

    if (rc) {
      rc.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
      });
    }
    return list;
  }

  app.use(cors('*'));

  app.use(
    graphqlEndpoint,
    bodyParser.json(),
    graphqlExpress({
      schema,
      context: {
        models,
        pubSub,
      }
    }),
  );

  app.use(
    graphiqlEndpoint,
    graphiqlExpress({
      endpointURL: graphqlEndpoint,
      subscriptionsEndpoint: `ws://localhost:${PORT}${subscriptionEndpoint}`,
    }),
  );

  models.sequelize.sync({}).then(() => {
    server.listen(PORT, () => {
      // eslint-disable-next-line no-new
      new SubscriptionServer(
        {
          execute,
          subscribe,
          schema,
          onConnect: async () => {
            // 鉴权
            return {}
          },
        }, {
          server,
          path: subscriptionEndpoint,
        },
      );
    });
  });
});
