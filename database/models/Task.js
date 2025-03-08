const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    status: {
        type: String,
        enum: ["in progress", "completed", "cancelled"],
        default: "in progress"
    },
    createdAt: { type: Date, default: Date.now, immutable: true }
});
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);


module.exports = mongoose.model("Task", taskSchema);