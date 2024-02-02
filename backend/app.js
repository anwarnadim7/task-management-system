const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3300;

const uri = 'mongodb://localhost:27017/TMS';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(cors());
app.use(express.json());

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  duedate: Date,
  completed: Boolean,
});

const Task = mongoose.model('Task', taskSchema);

app.post('/tasks', async (req, res) => {
  try {
    const { title, description, duedate, completed } = req.body;
    const newTask = new Task({ title, description, duedate, completed });
    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const { validationResult } = require('express-validator');

app.get('/tasks', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { page = 1, limit = 5, sortBy } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 5);

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = 1;
    }

    const totalTasks = await Task.countDocuments();
    const totalPages = Math.ceil(totalTasks / parsedLimit);

    if (parsedPage > totalPages) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    const tasks = await Task.find()
      .sort(sortOptions)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      tasks,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
        totalTasks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.put('/tasks/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, duedate, completed } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, description, duedate, completed },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/tasks/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', deletedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
