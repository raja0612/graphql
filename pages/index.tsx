import Head from 'next/head'
import styles from '../styles/Home.module.css'
import  {gql, useQuery} from '@apollo/client'
import { initializeApollo } from '../lib/client';


// this string converts into data structure called DocumentNode by gql
const TasksQueryDocument = gql`
query Tasks {
  tasks {
    id
    title
    status
  }
}
`;

interface TasksQuery{
  tasks: {id: number, title: string, status: string}[]
}

export default function Home() {

  const result = useQuery<TasksQuery>(TasksQueryDocument);

  const tasks = result.data?.tasks;
  console.log('raj2', tasks)

  return (
    <div className={styles.container}>
      <Head>
        <title>Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        tasks && tasks.length > 0 && tasks.map((task) => {
          return(
             <div key={task.id}> 
                 {task.title} - {task.status}
              </div>
          )
        })
      }
    </div>
  )
}

// the getStaticProps() is used for rendering TasksQuery data on server side

export const getStaticProps = async () => {
  const apolloClient = initializeApollo(); // this will intialize apolloClient from client.ts in lib folder

  // run the tasks query

  await apolloClient.query<TasksQuery>({
    query: TasksQueryDocument,
  });

  return {
    props: {
      initializeApolloState: apolloClient.cache.extract(),
    }
  };
}

// we use this initializeApolloState props in _app.tsx beacuse that wraps every page