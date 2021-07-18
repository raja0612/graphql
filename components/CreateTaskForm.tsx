import React, { useState } from "react";
import { useCreateTaskMutation } from "../generated/graphql-frontend";

interface Props {
    onSuccess: () => void;
}

const CreateTaskForm:React.FC<Props>  = ( {onSuccess} ) => {

    const [title, setTitle] = useState('');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         setTitle(e.target.value)
    }

    // first get the custom react mutation hook from graphql-frontend.ts

    const [createTask , {loading, error}] = useCreateTaskMutation({
        onCompleted: () => {
            onSuccess();

            // empty the text input after success
            setTitle('');
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // avoid multiple submission
        if(!loading) {
            try {
                await createTask({variables: {input: {title}}})
                // here also we can call callback onSuccess();
            } catch(e){
                //log error
                console.log(e)
            }
        }
    }


    return (
     <form onSubmit={handleSubmit}>
         {
             error && <p className="alert-error">An error occurred.</p>
         }
         <input 
         type="text" 
         name="title" 
         placeholder="what would you like to get done"
         autoComplete="off" 
         className="text-input new-task-text-input" 
         value={title} 
         onChange={handleTitleChange}
         />
     </form>
    );
}

export default CreateTaskForm;