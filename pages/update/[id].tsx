import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import { TaskDocument, TaskQuery, TaskQueryVariables, useTaskQuery } from "../../generated/graphql-frontend";
import { initializeApollo } from "../../lib/client";
import Error from "next/error";
import UpdateTaskForm from "../../components/UpdateTaskForm";

const UpdateTask = () => {
    //we should rtender getServerSideProps() data here but we read it from cache instead of making one more n/w call

    const router = useRouter();
    const id = typeof router.query?.id === 'string' ? parseInt(router.query.id, 10) : NaN;
    if(!id) {
        return <Error statusCode={404}></Error>
    }
    // run the query using apoloclient hook that is generated in <graphql-frontend className="ts"></graphql-frontend>
    const { data, loading, error } =  useTaskQuery({variables: {id: id}})
    const task = data?.task
    return loading ? 
    (<p>Loading...</p>)
     : error ? 
     (<p>An error occured.</p>) 
     : task ? 
     (<UpdateTaskForm  id={task.id} initialValues={{title: task.title}}/>) 
     : <p> Task not found.</p>
    
}

// we are going to render this page at server side, so rendering server side is synchronous
// inorder to reender this page at server side, we need to prepare the data before rendering



export const getServerSideProps: GetServerSideProps = async (context) => {
    //read id from server context
    const id = typeof context.params?.id === 'string' ? parseInt(context.params.id, 10) : NaN;
    if(id) {
        const apolloClient = initializeApollo();
        await apolloClient.query<TaskQuery, TaskQueryVariables>({
            query: TaskDocument,
            variables:{
                id: id
            }
        });

        return {
            props: { initiaApolloState: apolloClient.cache.extract() }
        }
    }
    return{props: {}}
}

export default UpdateTask;