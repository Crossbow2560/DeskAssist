"use client";

import styles from "./MyTasks.module.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Task {
  task_id: string;
  user_id: string;
  is_checked: boolean;
  task_title: string;
  task_description: string;
  tags?: string[];
  priority?: string;
  deadline?: string;
  created_at?: string;
}

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTasks = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/getUserData/tasks", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong while fetching tasks.");
    } finally {
      setLoading(false);
    }
  };
  const toggleTask = async (task: Task) => {
    try {
      const res = await fetch(
        "http://localhost:4000/updateData/updateTaskStatus",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            task_id: task.task_id,
            is_checked: !task.is_checked,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      // ✅ Update only this task locally
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.task_id === task.task_id ? { ...t, is_checked: !t.is_checked } : t,
        ),
      );
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div className={styles.tasksContainer}>
      <div className={styles.taskHeader}>My Tasks</div>

      {loading && <div className={styles.statusMessage}>Loading tasks...</div>}

      {error && <div className={styles.errorMessage}>{error}</div>}

      {!loading && !error && tasks.length === 0 && (
        <div className={styles.noTasks}>
          No tasks found. Create a new task to get started!
        </div>
      )}

      {!loading &&
        !error &&
        tasks.map((task) => (
          <div key={task.task_id} className={styles.taskItem}>
            {/* ✅ Clickable Checkbox */}
            <img
              src={
                task.is_checked
                  ? "/images/checkbox-checked.svg"
                  : "/images/checkbox-empty.svg"
              }
              alt="checkbox"
              onClick={() => toggleTask(task)}
              style={{ cursor: "pointer" }}
              className={
                task.is_checked ? styles.checkboxChecked : styles.checkboxEmpty
              }
            />

            <div
              className={
                task.is_checked ? styles.taskTitleChecked : styles.taskTitle
              }
            >
              {task.task_title}
            </div>
          </div>
        ))}
    </div>
  );
}
