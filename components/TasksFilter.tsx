import React from "react";
import Link from "next/link";

const TasksFilter = () => {
    return(
       <ul className="task-filter">
           <li>
               <Link href="/" scroll={false}>
                   <a>All</a>
               </Link>
           </li>
           <li>
               <Link href="/[status]" scroll={false} as="/active">
                   <a>Active</a>
               </Link>
           </li>
           <li>
               <Link href="/[status]" scroll={false} as="/complete">
                   <a>Completed</a>
               </Link>
           </li>
       </ul>

    );
}

export default TasksFilter;