const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    bio: String
    age: Int
    avatar: String
  }
  
  type UserResponse {
    user: User
    error: String
  }

  type UsersResponse {
    users: [User]
    error: String
  }

  type Query {
    getUsers: UsersResponse!
  }

  type Mutation {
    registerUser(name: String!, email: String!, password: String!): UserResponse!
    loginUser(email: String!, password: String!): UserResponse!
  }
`;

module.exports = typeDefs;