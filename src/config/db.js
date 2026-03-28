const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Create a connection just to create the database if it doesn't exist
const initializeDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await connection.end();

        // Now connect to the actual database
        const pool = mysql.createPool({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Initialize Tables
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createTasksTable = `
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
                user_id VARCHAR(36) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        await pool.query(createUsersTable);
        await pool.query(createTasksTable);
        
        console.log("Database initialized successfully.");
        return pool;
    } catch (error) {
        console.error("Database initialization failed:", error.message);
        process.exit(1);
    }
};

module.exports = { initializeDatabase };
