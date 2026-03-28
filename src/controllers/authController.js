const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');

const registerSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});

const register = async (req, res, next) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues.map(i => i.message) });
        }

        const { username, password } = parsed.data;
        const pool = req.app.get('dbPool');

        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = uuidv4();

        await pool.query('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [userId, username, hashedPassword]);

        const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const pool = req.app.get('dbPool');
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, message: 'Logged in successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };
