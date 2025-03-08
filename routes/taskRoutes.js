const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Task = require('../database/models/task');

// ✅ Helper function to validate task status
const isValidStatus = (status) => ["in progress", "completed", "cancelled"].includes(status);

// ✅ Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Create a new task
router.post('/', async (req, res) => {
    try {
        const { title, status } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        if (status && !isValidStatus(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const newTask = new Task(req.body);
        await newTask.save();

        if (global.io) {
            global.io.emit('taskCreated', newTask);
            global.io.emit('tasksUpdated', await Task.find()); // 🔹 Update task list
            global.io.emit('notification', { message: `📌 New task created: ${newTask.title}` });
        }

        res.status(201).json(newTask);
    } catch (error) {
        console.error("❌ Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Update a task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }

        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        if (status && !isValidStatus(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedTask) return res.status(404).json({ message: "Task not found" });

        if (global.io) {
            global.io.emit('taskUpdated', updatedTask);
            global.io.emit('tasksUpdated', await Task.find()); // 🔹 Update task list
            global.io.emit('notification', { message: `✏️ Task updated: ${updatedTask.title}` });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("❌ Error updating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }

        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) return res.status(404).json({ message: "Task not found" });

        if (global.io) {
            global.io.emit('taskDeleted', id);
            global.io.emit('tasksUpdated', await Task.find()); // 🔹 Update task list
            global.io.emit('notification', { message: `🗑️ Task deleted: ${deletedTask.title}` });
        }

        res.status(200).json({ message: "✅ Task deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
