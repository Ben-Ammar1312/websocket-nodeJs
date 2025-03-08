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
            message: `Nouvelle tâche ajoutée: ${newTask.title}`,
            taskId: newTask._id,
        });

        // Envoyer la notification en temps réel
        io.emit("receiveNotification", notification);

        res.status(201).json({ message: "Tâche créée avec succès", task: newTask });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// 📌 Mettre à jour une tâche et notifier
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(id, { title, description, status }, { new: true });

        if (!updatedTask) return res.status(404).json({ message: "Tâche non trouvée" });

        // Créer une notification
        const notification = await Notification.create({
            message: `Tâche mise à jour: ${updatedTask.title}`,
            taskId: updatedTask._id,
        });

        // Envoyer la notification
        io.emit("receiveNotification", notification);

        res.json({ message: "Tâche mise à jour", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// 📌 Supprimer une tâche et notifier
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) return res.status(404).json({ message: "Tâche non trouvée" });

        // Créer une notification
        const notification = await Notification.create({
            message: `Tâche supprimée: ${deletedTask.title}`,
            taskId: deletedTask._id,
        });

        // Envoyer la notification
        io.emit("receiveNotification", notification);

        res.json({ message: "Tâche supprimée", task: deletedTask });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};
