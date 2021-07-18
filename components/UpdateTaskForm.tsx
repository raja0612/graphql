import { isApolloError } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useUpdateTaskMutation } from "../generated/graphql-frontend";

interface FormValues {
    title: string;
}
interface Props {
    id: number;
    initialValues: FormValues
}

const UpdateTaskForm: React.FC<Props> = ({initialValues, id}) => {
    const [values, setValues] = useState<FormValues>(initialValues);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues((prevState) => ({...prevState, [name]: value }));

    }

    //useUpdateTaskMutation() run
    //updateTask is the funtion that run the mutation
    const [updateTask, {loading, error}] = useUpdateTaskMutation();

    const router = useRouter();

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
           const result =  await updateTask({
                variables: {input: {id, title: values.title}}
            })
            // redircet the user after succeessful
            if (result.data?.updateTask) {
              router.push('/');
            }
        } catch(e) {
            //log the error
            if(isApolloError(e)){
                console.log('apollo error');
            }
            console.log(e);
        }
    }


    // generic error message
    let errorMessage = '';

    if(error) {
        if(error.networkError) {
            errorMessage = 'A Network error occured. Please try again';
        } else {
            errorMessage = 'Sorry. something went wrong';
            console.log('resolver throw an error', error.graphQLErrors);
            if(error.graphQLErrors) {
            }
        }

    }

    return (
        <form onSubmit={submitHandler}>
            { error && <p className="alert-error">{error.message} - {errorMessage}</p>}
            <p>
            <label className="field-label">Title</label>
            <input type="text" name="title" className="text-input" 
            value={values.title} onChange={handleChange}/>
            </p>
            <p>
                <button className= "button" type="submit" disabled={loading}>{loading ? 'Loading' : 'Save'} </button>
                
            </p>

        </form>
    );
}

export default UpdateTaskForm;