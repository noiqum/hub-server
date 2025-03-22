import express from 'express';
import bcrypt from 'bcrypt';
import supabase from '../config/supabase';
import jwt from 'jsonwebtoken';



// Register Controller
const registerController = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }

        // Check if email already exists
        const { data: existingUsers, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1);

        if (fetchError) {
            res.status(500).json({ error: fetchError.message });
            return;
        }
        if (existingUsers && existingUsers.length > 0) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name }])
            .select('id, email, name');

        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }

        const user = data[0];

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Login Controller
const loginController = async (req: express.Request, res: express.Response) => {
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

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export { registerController, loginController };