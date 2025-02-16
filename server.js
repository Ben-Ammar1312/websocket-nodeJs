const express = require('express');
const connectDB = require('./config/db'); // Connexion à la base de données
const taskRoutes = require('./routes/taskRoutes'); // Import des routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
