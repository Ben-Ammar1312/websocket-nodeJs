const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    status: { type: String, enum: ["in progress", "completed", "cancelled"], default: "in progress" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", taskSchema);
