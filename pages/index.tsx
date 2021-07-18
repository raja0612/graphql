import Head from 'next/head'
import { initializeApollo } from '../lib/client';
import { TasksDocument, TasksQuery, useTasksQuery } from '../generated/graphql-frontend';
import TasksList from '../components/TasksList';
import CreateTaskForm from '../components/CreateTaskForm';
import TasksFilter from '../components/TasksFilter';


export default function Home() {
  const result = useTasksQuery();
  // result.refetch rerun the tasks query and re render the component.

  // callback prop



  const tasks = result.data?.tasks;
  console.log('raj2', tasks)

  return (
    <div>
      <Head>
        <title>Tasks</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreateTaskForm onSuccess={result.refetch}/>

      {
        result.loading ? (
        <p>Loading tasks...</p>
      ) : result.error ? (
        <p>An error occurred.</p>
      ) : tasks && tasks.length > 0 ? (
        <TasksList tasks={tasks} />
      ) : (
        <p className="no-tasks-message">You've got no tasks.</p>
      )}
      <TasksFilter />
    </div>
  )
}

// the getStaticProps() is used for rendering TasksQuery data on server side

export const getStaticProps = async () => {
  const apolloClient = initializeApollo(); // this will intialize apolloClient from client.ts in lib folder

  // run the tasks query

  await apolloClient.query<TasksQuery>({
    query: TasksDocument,
  });

  return {
    props: {
      initializeApolloState: apolloClient.cache.extract(),
    }
  };
}

// we use this initializeApolloState props in _app.tsx beacuse that wraps every page