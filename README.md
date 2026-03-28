# Simple Task Management Rest API

A robust Task Management REST API built with Node.js, Express, and MySQL. It features user authentication and validation, supporting CRUD operations for tasks. It comes with a modern, glassmorphic UI.

## Features
- **User Authentication:** Registration and Login with JWT and bcrypt.
- **CRUD Tasks:** Create, Read, Update, and Delete tasks easily.
- **Pagination:** Task list inherently supports pagination logic out of the box.
- **Input Validation:** Done using `zod` for maximum robustness.
- **Beautiful UI:** Integrated vanilla JS frontend showcasing visual excellence.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Packages used:** `mysql2`, `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `zod`, `uuid`
- **Frontend:** HTML, CSS, Javascript (Served dynamically via node express static maps)

## Prerequisites
- Node.js installed.
- MySQL server installed and running.

## Getting Started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repo_url>
   cd Simple_Task_Manager
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database**:
   - Create a MySQL Database (optional, the script will attempt to create `task_manager` automatically if your user has privileges).
   - Edit the `.env` file with your MySQL credentials.
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=task_manager
   JWT_SECRET=supersecret_task_manager_key_123
   ```

4. **Start the server**:
   ```bash
   node src/server.js
   ```

5. **View the Application**:
   Open a browser to `http://localhost:5000` to interact with the frontend UI.

## API Documentation
Postman / Curl commands are available in `commands.md`.

## Database Schema
The database uses two tables: `users` and `tasks`.

### Users Table
- `id` (VARCHAR 36, UUID Primary Key)
- `username` (VARCHAR 255, Unique)
- `password` (VARCHAR 255)
- `created_at` (TIMESTAMP)

### Tasks Table
- `id` (VARCHAR 36, UUID Primary Key)
- `title` (VARCHAR 255)
- `description` (TEXT)
- `status` (ENUM: 'pending', 'in-progress', 'completed')
- `user_id` (VARCHAR 36, Foreign Key -> users.id)
- `created_at` (TIMESTAMP)
