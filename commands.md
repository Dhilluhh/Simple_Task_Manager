# Simple Task Manager API Commands

Run the cURL commands directly below or import them into Postman.

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"password123"}'
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"password123"}'
```
*(Copy the token from the response for the following requests)*

### 3. Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_TOKEN_HERE>" \
-d '{"title":"Buy groceries","description":"Milk, eggs, and bread.","status":"pending","deadline":"2026-12-31T23:59:00"}'
```

### 4. Get All Tasks (with pagination support)
```bash
curl -X GET 'http://localhost:5000/api/tasks?page=1&limit=5' \
-H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### 5. Get Single Task
```bash
curl -X GET http://localhost:5000/api/tasks/<TASK_ID_HERE> \
-H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### 6. Update Task
```bash
curl -X PUT http://localhost:5000/api/tasks/<TASK_ID_HERE> \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <YOUR_TOKEN_HERE>" \
-d '{"title":"Buy groceries and coffee","status":"completed","deadline":"2026-12-31T12:00:00"}'
```

### 7. Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/<TASK_ID_HERE> \
-H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```
