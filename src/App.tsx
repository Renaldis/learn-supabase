import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabase-client";

type Target = {
  target: {
    name: string;
    value: string;
  };
};

type Data = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

function App() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [taskList, setTaskList] = useState<Data[] | null>([]);
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState({
    titleMessageErr: "",
    descMessageErr: "",
  });
  const [loading, setLoading] = useState(false);

  // handle change
  const handleChange = ({ target: { name, value } }: Target) => {
    setNewTask((prevTask) => {
      return {
        ...prevTask,
        [name]: value,
      };
    });
  };

  // fetch task
  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error get tasks", error.message);
    }
    setTaskList(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [loading]);

  // submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newTask.title.length < 5) {
      return setError((prev) => {
        return {
          ...prev,
          titleMessageErr: "Title Minimal 5 karakter",
        };
      });
    }
    if (newTask.title.length >= 5) {
      setError((prev) => {
        return {
          ...prev,
          titleMessageErr: "",
        };
      });
    }

    if (newTask.description.length < 5) {
      return setError((prev) => {
        return {
          ...prev,
          descMessageErr: "Description Minimal 5 karakter",
        };
      });
    }
    if (newTask.description.length >= 5) {
      setError((prev) => {
        return {
          ...prev,
          descMessageErr: "",
        };
      });
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("tasks").insert(newTask).single();

      if (error) {
        console.error("Error adding task: ", error.message);
      }

      setNewTask({ title: "", description: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // delete task
  const deleteTask = async (id: number) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) {
        console.error("Error deleting task: ", error.message);
      }

      setNewTask({ title: "", description: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  // update task
  const updateTask = async (id: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("tasks")
        .update({ description: editDescription })
        .eq("id", id);
      if (error) {
        console.error("Error updating task: ", error.message);
      }

      setEditDescription("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ maxWidth: "600px", margin: "0", padding: "1rem" }}>
      <h2>Task Manager Crud</h2>

      {/* Form to add a new task */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Task Title"
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          name="title"
          onChange={handleChange}
          value={newTask.title}
        />
        {error.titleMessageErr && (
          <p style={{ marginTop: "-1px", color: "red" }}>
            {error.titleMessageErr}
          </p>
        )}
        <textarea
          placeholder="Task Description"
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          name="description"
          onChange={handleChange}
          value={newTask.description}
        />
        {error.descMessageErr && (
          <p style={{ marginTop: "-1px", color: "red" }}>
            {error.descMessageErr}
          </p>
        )}
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Task
        </button>
      </form>

      {/* List of Tasks */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {taskList?.map((item) => (
          <li
            key={item.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <textarea
                  name=""
                  id=""
                  placeholder="Edit Description"
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button
                  style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                  type="button"
                  onClick={() => updateTask(item.id)}
                >
                  Edit
                </button>
                <button
                  style={{ padding: "0.5rem 1rem" }}
                  onClick={() => deleteTask(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
