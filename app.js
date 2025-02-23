const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


// 🔹 Initialize Express App
const app = express();


// 🔹 Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Routes
const indexRouter = require('./routes/index');
const taskRouter = require('./routes/taskRoutes'); // Task routes

app.use('/', indexRouter);
app.use('/tasks', taskRouter); // Ensure task routes are added

// 🔹 Export app
module.exports = app;
