import { ApolloServer, gql, IResolvers} from 'apollo-server-micro'
import { title } from 'process';
import mysql from 'serverless-mysql';
import { OkPacket } from 'mysql';

const typeDefs = gql`

enum TaskStatus {
  active
  completed
} 

type Task {
  id: Int!
  title: String!
  status: TaskStatus
}

input CreateTaskInput {
  title: String
  Status: TaskStatus
}

input UpdateTaskInput {
  title: String!
}

type Query {
    tasks(status: TaskStatus): [Task!]!
    task(id: Int!): Task
}

type Mutation {
  createTask(input: CreateTaskInput!): Task
  updateTask(input: UpdateTaskInput!): Task
  deleteTask(id: Int!): Task
}
`

interface AppoloContext {
  db: mysql.ServerlessMysql
}

enum TaskStatus {
  active = 'active',
  completed = 'completed'
}

interface TaskDbRow {
  id: number;
  title: string;
  status: TaskStatus;
}


interface Task {
  id?: number;
  title: string;
  status: TaskStatus;
}

type TaskDbQueryResult = TaskDbRow[];

const resolvers: IResolvers<any, AppoloContext> = {
  Query: {
    async tasks(parent, 
      args: {status?: TaskStatus}, 
      context): 
      Promise<TaskDbRow[]> { 

      let query = 'SELECT  id, title, status FROM tasks';
      const { status } = args;
      const queryParams: string[] = [];

      if(status) {
        query += ' WHERE status = ?'
        queryParams.push(status);
      }
    

      const tasks = await context.db.query<TaskDbQueryResult>(query, queryParams);
      await db.end();
      return tasks;

    },
    task(parent, args, context) {
      return null
    },
  },

  Mutation: {
    async createTask(parent, args: {input: {title: string}}, context): Promise<Task> {

      const query = 'INSERT INTO tasks (title, status) VALUES (?, ?)'
      const queryParams: string[] = [args.input.title, TaskStatus.active];
      const result = await context.db.query<OkPacket>(query, queryParams);
      return {
        id: result.insertId, title: args.input.title, status: TaskStatus.active
      };
    },
    updateTask(parent, args, context) {
      return null
    },
    deleteTask(parent, args, context) {
      return null
    },

  }
}

const db = mysql({
  config:{
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DTABASE,
    password: process.env.MYSQL_PASSWORD,
    port: 3306
  }
});

const apolloServer = new ApolloServer({ typeDefs, resolvers, context: {db} })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })