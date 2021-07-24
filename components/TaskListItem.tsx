import React, { useEffect } from "react";
import Link from 'next/link';
import { Task, TaskStatus, useDeleteTaskMutation, useUpdateTaskMutation } from "../generated/graphql-frontend";
import { Reference } from "@apollo/client/";

interface Props {
    task: Task
}

const TaskListItem: React.FC<Props> = ({task}) => {
    // first get useDeleteTaskMutation mutation
    const [deleteTask, {loading, error}] = useDeleteTaskMutation({
        variables: {id: task.id},
        errorPolicy: 'all',
        // update cache after successful delete, so item will be deleted from list
        update: (cache, result) => {
            const deletedTask = result?.data?.deleteTask;

            if(deletedTask) {
                console.log(cache.extract())
                cache.modify({
                    fields: {
                        tasks(taskRefs: Reference[], { readField }){
                            console.log(taskRefs);
                            return taskRefs.filter(taskRef => {
                                return readField('id', taskRef) !== deletedTask.id;
                            })
                        }
                    }
                });
            }

        }
    })
    const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await deleteTask();
        } catch(e) {
            console.log('error', e)
        }
        
    }

    // opening alert biox when error occureed is a side effect so use useEffect() hook
    // react calls this hook  when error changes
    useEffect(() => {
       if(error) {
           alert('An eeror occured, Please try again'+error);
       }
    }, [error])

    //get useUpdateTaskMutation to update task
    const [updateTask, {loading: updateTaskLoading, error: updateTaskError}] = useUpdateTaskMutation({
        errorPolicy: 'all'
    })

    const handleStatucChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const newStatus  = e.target.checked ? TaskStatus.Completed : TaskStatus.Active;   
        updateTask({
            variables:{
                input:{
                    id: task.id,
                    title: task.title,
                    status: newStatus
                }
            }
        })
    }

    // show alert when updateTaskError is occured
    useEffect(() => {
        if(updateTaskError) {
            alert('An Error occured');
        }

    }, [updateTaskError])


    return(
        <li className="task-list-item" key={task.id}> 
            <label className="checkbox">
                <input type="checkbox"  onChange={handleStatucChange} 
                checked={task.status  === TaskStatus.Completed} disabled={updateTaskLoading}/>
                <span className="checkbox-mark">&#10003;</span>
                
            </label>
            <Link href="/update/[id]" as={`/update/${task.id}`}>
                <a className="task-list-item-title"> {task.title}</a>
            </Link>
            <button className="task-list-item-delete" 
                    onClick={handleDeleteClick} 
                    disabled={loading}>&times;
            </button>
        </li>
    );
}

export default TaskListItem;