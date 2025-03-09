const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { io } = require("../server");

// 📌 Créer une tâche et envoyer une notification
exports.createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const newTask = await Task.create({ title, description, status });

        // Créer une notification
        const notification = await Notification.create({
            message: `Nouvelle tâche ajoutée: ${title}`,
        });

        io.emit("taskCreated", newTask);
        io.emit("notification", notification);

        res.status(201).json(newTask);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating task");
    }
};

// 📌 Mettre à jour une tâche et envoyer une notification
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status } = req.body;

        const task = await Task.findByIdAndUpdate(taskId, { title, description, status }, { new: true });

        const notification = await Notification.create({
            message: `Tâche mise à jour: ${task.title}`,
        });

        io.emit("taskUpdated", task);
        io.emit("notification", notification);

        res.status(200).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating task");
    }
};
