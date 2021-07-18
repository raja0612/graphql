import { makeExecutableSchema } from 'graphql-tools'
import { typeDefs } from './type-defs' // graph ql query type definitions
import { resolvers } from './resolvers' // graph ql query and mutation resolvers

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

// this file contains configuartion of backend graph ql query type definitions and resolvers.
// and is used in graphql.ts when apploo server initialization
// on fron end client.ts under lib folder