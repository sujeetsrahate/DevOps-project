const express = require("express");
const cors = require("cors");
const client = require("prom-client");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* -----------------------------
   Prometheus Metrics
----------------------------- */

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

const httpRequests = new client.Counter({
  name: "student_task_http_requests_total",
  help: "Total HTTP requests"
});

register.registerMetric(httpRequests);

app.use((req, res, next) => {
  httpRequests.inc();
  next();
});

/* -----------------------------
   Temporary Task Data
----------------------------- */

let tasks = [
  {
    id: 1,
    title: "Learn Docker",
    completed: false
  },
  {
    id: 2,
    title: "Learn Kubernetes",
    completed: false
  },
  {
    id: 3,
    title: "Practice Jenkins",
    completed: true
  }
];

/* -----------------------------
   Health Check
----------------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "UP",
    message: "Backend is running"
  });
});

/* -----------------------------
   Get Tasks
----------------------------- */

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

/* -----------------------------
   Add Task
----------------------------- */

app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Task title is required"
    });
  }

  const task = {
    id: Date.now(),
    title,
    completed: false
  };

  tasks.push(task);

  res.status(201).json(task);
});

/* -----------------------------
   Complete / Uncomplete Task
----------------------------- */

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  task.completed = !task.completed;

  res.json(task);
});

/* -----------------------------
   Delete Task
----------------------------- */

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const oldLength = tasks.length;

  tasks = tasks.filter((task) => task.id !== id);

  if (tasks.length === oldLength) {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  res.json({
    message: "Task deleted successfully"
  });
});

/* -----------------------------
   Application Info
----------------------------- */

app.get("/api/info", (req, res) => {
  res.json({
    application: "Student Task Manager",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

/* -----------------------------
   Prometheus Metrics
----------------------------- */

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());
});

/* -----------------------------
   Start Server
----------------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});