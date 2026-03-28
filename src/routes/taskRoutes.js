const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate); // Require authentication for all task routes

router.route('/')
    .get(getTasks)
    .post(createTask);

router.route('/:id')
    .get(getTaskById)
    .put(updateTask)
    .patch(updateTask)
    .delete(deleteTask);

module.exports = router;
