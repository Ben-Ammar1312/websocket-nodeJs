const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Task = require('../database/models/task');

// Helper function to validate task status
const isValidStatus = (status) => ['in progress', 'completed', 'cancelled'].includes(status);

// Create Task
router.post('/', async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        const newTask = new Task(req.body);
        await newTask.save();

        if (global.io) {
            global.io.emit('taskCreated', newTask);
        } else {
            console.error("WebSocket `io` is not initialized");
        }

        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get task by ID
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        res.status(200).json(task);
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update Task
router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }

        if (!req.body.title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedTask) return res.status(404).json({ message: "Task not found" });

        if (global.io) {
            global.io.emit('taskUpdated', updatedTask);
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Task
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }

        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: "Task not found" });

        if (global.io) {
            global.io.emit('taskDeleted', req.params.id);
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;