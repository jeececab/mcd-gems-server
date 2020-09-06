require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const redis = require('redis');
const session = require('express-session');
const connectRedis = require('connect-redis');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs');

const startServer = async () => {
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: 'http://localhost:5000',
      credentials: true
    })
  );

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: process.env.ENV === 'production'
        //domain: 'localhost:5000'
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false
    })
  );

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({
      req,
      res,
      auth: req.session.userId
    })
  });

  apolloServer.applyMiddleware({ app, cors: false });

  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

  const port = process.env.PORT;

  app.listen(port, () => console.log(`🚀 Server is up on port ${port}`));
};

startServer();
