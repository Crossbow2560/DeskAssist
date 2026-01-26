"use client";

import styles from "./page.module.css";

import Navbar from "../components/Navbar/Navbar.jsx"

import ToDo from "../components/ToDo/ToDo.jsx";

import { fetchTodos } from "./script";

import { useState, useEffect } from 'react';

type Todo = {
  id: string;
  description: string;
  isCompleted: boolean;
  priority: 'none' | 'low' | 'medium' | 'high';
  created_at?: string;
};

export default function Todo(){
    const [todos, setTodos] = useState<Todo[]>([]);
    const [refresh, setRefresh] = useState(false);
    useEffect(() => {
        async function getTodos() {
            const todos = await fetchTodos();
            console.log(todos);
            setTodos(todos);
        }
        getTodos();
        setRefresh(false);
    }, [refresh]);
    
    const addToDoText = "+ Add To-Do"

    const addTodo = () => {
        setTodos([...todos, {
            id: crypto.randomUUID(),
            description: "",
            isCompleted: false,
            priority: 'none',
            created_at: new Date().toISOString(),
        }]);
    }

    return(
        <main className={styles.container}>
            <Navbar />
            <div className={styles.header}>Your To-Do's</div>
            {todos.length === 0 && <div className={styles.notext}>You Have no To Do’s. Click <u>Add To-Do</u> to get started</div>}
            <div className={styles.addtodo} onClick={addTodo}>{addToDoText}</div>
            {todos.map((todo) => (
                <ToDo
                    id={todo.id}
                    key={todo.id}
                    isCompleted={todo.isCompleted}
                    description={todo.description}
                    priority={todo.priority}
                    date={todo.created_at}
                    refresh={() => {setRefresh(true)}}
                />
            ))}
        </main>
    )
}
