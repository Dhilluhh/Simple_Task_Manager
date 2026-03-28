const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');

const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional()
});

const getTasks = async (req, res, next) => {
    try {
        const pool = req.app.get('dbPool');
        const userId = req.user.id;
        
        // Pagination logic
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [userId]);
        const total = countResult[0].count;

        res.status(200).json({
            data: tasks,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getTaskById = async (req, res, next) => {
    try {
        const pool = req.app.get('dbPool');
        const [task] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        
        if (task.length === 0) return res.status(404).json({ error: 'Task not found' });
        
        res.status(200).json(task[0]);
    } catch (error) {
        next(error);
    }
};

const createTask = async (req, res, next) => {
    try {
        const parsed = taskSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues });
        }

        const { title, description = '', status = 'pending' } = parsed.data;
        const taskId = uuidv4();
        const pool = req.app.get('dbPool');

        await pool.query(
            'INSERT INTO tasks (id, title, description, status, user_id) VALUES (?, ?, ?, ?, ?)',
            [taskId, title, description, status, req.user.id]
        );

        const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

        res.status(201).json(newTask[0]);
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const pool = req.app.get('dbPool');
        
        const [existingTask] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (existingTask.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        const parsed = z.object({
            title: z.string().min(1).optional(),
            description: z.string().optional(),
            status: z.enum(['pending', 'in-progress', 'completed']).optional()
        }).safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues });
        }

        const { title = existingTask[0].title, description = existingTask[0].description, status = existingTask[0].status } = parsed.data;

        await pool.query(
            'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
            [title, description, status, req.params.id, req.user.id]
        );

        const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

        res.status(200).json(updatedTask[0]);
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        const pool = req.app.get('dbPool');
        
        const [existingTask] = await pool.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (existingTask.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
