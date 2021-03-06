const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    bio: String
    age: Int
    avatar: String
    drills: [Drill]
  }

  type Drill {
    id: ID!
    title: String!
    description: String
    user_id: ID
    user: User
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    avatar: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    registerUser(name: String!, username: String!, email: String!, password: String!): User
    loginUser(email: String!, password: String!): User
    logoutUser: Boolean
    uploadAvatar(file: Upload!): User!
    deleteAvatar: Boolean
    uploadAccountInfo(name: String!, email: String!, bio: String!): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean
    createDrill(title: String!, description: String): Drill
  }
`;

module.exports = typeDefs;
