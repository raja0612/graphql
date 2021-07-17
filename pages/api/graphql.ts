import { ApolloServer, gql, UserInputError } from 'apollo-server-micro'
import { title } from 'process';
import mysql from 'serverless-mysql';
import { OkPacket } from 'mysql';
import { Resolvers, TaskStatus } from '../../generated/graphql-backend';

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
  title: String!
  Status: TaskStatus
}

input UpdateTaskInput {
  id: Int!
  title: String!
  status: TaskStatus
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


interface TaskDbRow {
  id: number;
  title: string;
  status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];
type TaskDbQueryResult = TaskDbRow[];


const getTaskById = async (id:number, db: mysql.ServerlessMysql) => {
  const query  ='SELECT id, title, status FROM tasks WHERE id = ?';

  const tasks = await db.query<TaskDbQueryResult>(query, [id]);
  console.log(tasks)
  return tasks.length ? {id: tasks[0].id, title: tasks[0].title, status: tasks[0].status} : null
}

const resolvers: Resolvers<AppoloContext> = {
  Query: {
    async tasks(
      parent, 
      args, 
      context) { 

      let query = 'SELECT  id, title, status FROM tasks';
      const { status } = args;
      const queryParams: string[] = [];

      if(status) {
        query += ' WHERE status = ?'
        queryParams.push(status);
      }
    

      const tasks = await context.db.query<TasksDbQueryResult>(query, queryParams);
      await db.end();
      return tasks;

    },
    async task(parent, args, context) {
       return await getTaskById(args.id, context.db);
    },
  },

  Mutation: {
    async createTask(parent,args, context) {

      const query = 'INSERT INTO tasks (title, status) VALUES (?, ?)'
      const queryParams: string[] = [args.input.title, TaskStatus.Active];
      const result = await context.db.query<OkPacket>(query, queryParams);
      return {
        id: result.insertId, title: args.input.title, status: TaskStatus.Active
      };
    },
    async updateTask(parent, args, context) {
      console.log(args)

      const columns: string[] = [];
      const sqlParams: any[] = [];

      if(args.input.title){
        columns.push('title = ?');
        sqlParams.push(args.input.title);
      }

      if(args.input.status){
        columns.push('status = ?');
        sqlParams.push(args.input.status);
      }
      sqlParams.push(args.input.id);
      const query = `UPDATE tasks SET ${columns.join(',')} WHERE id = ?`;
      console.log(query);
      await context.db.query(query, sqlParams);
      return getTaskById(args.input.id, context.db);
    },
    async deleteTask(parent, args, context) {
      const task = await getTaskById(args.id, context.db);
      if(!task) {
        throw new UserInputError("Sorry! Couldn't find the task");
      }
      const query = 'DELETE FROM tasks where id = ?';
      const { id } = args;
      const queryParams = []
      queryParams.push(id);
      await context.db.query(query, queryParams);
      return task;
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