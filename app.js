require('dotenv').config(); // ✅ Load environment variables first
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./database/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoute = require("./routes/route");
const http = require('http');
const { Server } = require('socket.io');
const verifyToken = require("./middlewares/authMiddleware");
// 🔹 Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const Task = require('./database/models/task');
// 🔹 Connect to Database
connectDB();

// 🔹 Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//dashbord
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dash.html'));
});

// 🔹 Auth Check Route (Ensures WebSocket starts only for logged-in users)
app.get("/api/auth-check", (req, res) => {
    if (req.cookies && req.cookies.token) {
        return res.json({ authenticated: true });
    } else {
        return res.json({ authenticated: false });
    }
});
app.get("/", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});


// 🔹 CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// 🔹 Routes
const indexRouter = require('./routes/index');
app.use('/', indexRouter);
app.use('/api/tasks', taskRoutes);
app.use('/api', authRoute);

// 🔹 Create HTTP & WebSocket Server (after initializing `app`)
const server = http.createServer(app);
global.io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// 🔹 WebSocket Connection
global.io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// 🔹 Start Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 🔹 Export app and WebSocket server
module.exports = { app };


app.get('/api/tasks/stats', async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const inProgress = await Task.countDocuments({ status: { $regex: /^in\s*progress$/i } });
        const completed = await Task.countDocuments({ status: 'completed' });

        console.log("Total Tasks:", totalTasks);
        console.log("In Progress:", inProgress);
        console.log("Completed:", completed);

        res.json({ totalTasks, inProgress, completed });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
});




app.get('/api/tasks/totalTasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches' });
    }
});

// Route pour récupérer les tâches en cours
app.get('/api/tasks/inProgress', async (req, res) => {
    try {
        const tasks = await Task.find({ status: 'in progress' });
        res.json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches en cours :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches en cours' });
    }
});


// Route pour récupérer les tâches complétées
app.get('/api/tasks/completed', async (req, res) => {
    try {
        const tasks = await Task.find({ status: 'completed' });
        res.json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches complétées :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des tâches complétées' });
    }
});
