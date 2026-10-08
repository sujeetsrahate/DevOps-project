import { useEffect, useState } from "react";

const API_URL = "/api";

function App() {

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {

    try {

      const response = await fetch(`${API_URL}/tasks`);

      const data = await response.json();

      setTasks(data);

    } catch (error) {

      console.error("Failed to load tasks", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadTasks();

  }, []);

  const addTask = async (event) => {

    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title
        })
      });

      const newTask = await response.json();

      setTasks([...tasks, newTask]);

      setTitle("");

    } catch (error) {

      console.error("Failed to add task", error);

    }
  };

  const toggleTask = async (id) => {

    try {

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT"
      });

      const updatedTask = await response.json();

      setTasks(
        tasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      );

    } catch (error) {

      console.error("Failed to update task", error);

    }
  };

  const deleteTask = async (id) => {

    try {

      await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE"
      });

      setTasks(
        tasks.filter((task) => task.id !== id)
      );

    } catch (error) {

      console.error("Failed to delete task", error);

    }
  };

  return (
    <div className="container">

      <div className="card">

        <h1>Student Task Manager</h1>

        <p className="subtitle">
          Simple DevOps Learning Project
        </p>

        <form onSubmit={addTask}>

          <input
            type="text"
            placeholder="Enter your task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <button type="submit">
            Add Task
          </button>

        </form>

        {loading ? (

          <p>Loading tasks...</p>

        ) : (

          <div className="tasks">

            {tasks.length === 0 ? (

              <p>No tasks available.</p>

            ) : (

              tasks.map((task) => (

                <div
                  className={`task ${
                    task.completed ? "completed" : ""
                  }`}
                  key={task.id}
                >

                  <span
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? "✓" : "○"}{" "}
                    {task.title}
                  </span>

                  <button
                    className="delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default App;
