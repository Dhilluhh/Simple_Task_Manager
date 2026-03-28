const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/db');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Create an async function to start the app
const startServer = async () => {
    // Initialize DB and get connection pool
    const pool = await initializeDatabase();
    
    // Make pool accessible within routes/controllers
    app.set('dbPool', pool);

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/tasks', require('./routes/taskRoutes'));

    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    });

    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();
