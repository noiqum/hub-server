import express from 'express';
import bcrypt from 'bcrypt';
import supabase from '../config/supabase';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' })
        }

        // Check if email already exists
        const { data: existingUsers, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1)

        if (fetchError) {
            res.status(500).json({ error: fetchError.message })
        }
        if (existingUsers && existingUsers.length > 0) {
            res.status(400).json({ error: 'Email already in use' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert user into database
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name }])
            .select('id, email, name')

        if (error) {
            res.status(500).json({ error: error.message })
        }

        if (data) {
            res.status(201).json({ message: 'User registered', user: data[0] })
        }

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Fetch user from Supabase
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, password, name, role')
            .eq('email', email)
            .limit(1);

        if (error || !users || users.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = users[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;