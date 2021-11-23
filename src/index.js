import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import "dotenv/config";
import models, { connectDB } from "./models";
import typeDefs from "./schema";
import resolvers from "./resolvers";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { graphqlUploadExpress } from "graphql-upload";

let ObjectId = mongoose.Types.ObjectId;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const getMe = async (req) => {
  const token = req.headers["x-token"];
  if (token) {
    try {
      const me = await jwt.verify(token, process.env.SECRET);
      return await models.User.findById(me.id);
    } catch (e) {
      throw new AuthenticationError("Session Invalid or expired.");
    }
  }
};

// const server = new ApolloServer({
//     typeDefs : schema,
//     resolvers,
//     schemaDirectives,
//     formatError : error => {
//         const message = error.message
//         .replace('SequelizeValidationError: ', '')
//         .replace('Validation error: ', '')

//       return { ...error, message };
//     },
//     formatResponse : response => response,
//     context : async ({req, res}) => {
//         if(req){
//             const me = await getMe(req)
//             return {
//                 models,
//                 me,
//                 secret: process.env.SECRET
//             }
//         }
//     }
// })

// server.applyMiddleware({ app, path : '/graphql' });
// const httpServer = http.createServer(app);
// server.installSubscriptionHandlers(httpServer)

// connectDB().then( async () => {
//     httpServer.listen({ port }, () => {
//         console.log(`Apollo Server on http://localhost:${port}/graphql`);
//     })
// } )

async function startServer() {
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    formatError: (error) => {
      const message = error.message
        .replace("SequelizeValidationError: ", "")
        .replace("Validation error: ", "");

      return { ...error, message };
    },
    formatResponse: (response) => response,
    context: async ({ req, connection, res }) => {
      if (connection) {
        return {
          models,
        };
      }
      if (req) {
        const me = await getMe(req);
        return {
          models,
          me,
          secret: process.env.SECRET,
        };
      }
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect() {},
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );

  await server.start();
  //app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });

  connectDB().then(async () => {
    httpServer.listen(process.env.PORT, () =>
      console.log(
        `Server is now running on http://localhost:${process.env.PORT}/graphql`
      )
    );
  });
}

startServer();
