import Head from 'next/head'
import { initializeApollo } from '../lib/client';
import { TasksQueryVariables, TasksDocument, TasksQuery, TaskStatus, useTasksQuery } from '../generated/graphql-frontend';
import TasksList from '../components/TasksList';
import CreateTaskForm from '../components/CreateTaskForm';
import TasksFilter from '../components/TasksFilter';
import { useRouter } from 'next/router';
import Error from 'next/error';
import { GetServerSideProps } from 'next';


const isTaskStatus = (value: string): value is TaskStatus =>
                    Object.values(TaskStatus).includes(value as TaskStatus);


export default function Home() {
  const router = useRouter();
  const status = Array.isArray(router.query.status) && router.query.status.length ?  router.query.status[0]  : undefined;
  console.log('status dynamic request param', status);

  if(status !== undefined && !isTaskStatus(status)) {
      return <Error  statusCode={404}/>
  }

  const result = useTasksQuery({
      variables: {status},
      fetchPolicy: 'cache-and-network'
  });

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
          result.loading  && !tasks ? (
          <p>Loading tasks...</p>
        ) : result.error ? (
          <p>An error occurred.</p>
        ) : tasks && tasks.length > 0 ? (
          <TasksList tasks={tasks} />
        ) : (
          <p className="no-tasks-message">You've got no tasks.</p>
        )}
      <TasksFilter status={status} />
    </div>
  )
}

// the getStaticProps() is used for rendering TasksQuery data on server side
//export const getStaticProps = async () => {

//getServerSideProps tell next js, we wont render this page using server side rendering
export const getServerSideProps: GetServerSideProps = async (context) => {

  const status = typeof context.params?.status === 'string' ? context.params.status  : undefined;

  if(status === 'undefined' || isTaskStatus(status)){
    // this will intialize apolloClient from client.ts in lib folder
    const apolloClient = initializeApollo(); 
 
    // run the tasks query
    await apolloClient.query<TasksQuery, TasksQueryVariables>({
      query: TasksDocument,
      variables: {status}
    });
  
    return {
      props: {
        initializeApolloState: apolloClient.cache.extract(),
      }
    };
  }
  return{props: {}}
}
// we use this initializeApolloState props in _app.tsx beacuse that wraps every page