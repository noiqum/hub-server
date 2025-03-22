import express from 'express';
import bcrypt from 'bcrypt';
import supabase from '../config/supabase';
import jwt from 'jsonwebtoken';
import { sendError, sendSuccess } from '../utils/responseUtils';


// Register Controller
const registerController = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            sendError(res, 'Email, password, and name are required', 400);
            return;
        }

        // Check if email already exists
        const { data: existingUsers, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1);

        if (fetchError) {
            sendError(res, fetchError.message, 500);
            return;
        }
        if (existingUsers && existingUsers.length > 0) {
            sendError(res, 'Email already in use', 409);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name, role: 'user' }])
            .select('id, email, name, role');

        if (error) {
            sendError(res, error.message, 500);
            return;
        }

        const user = data[0];

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        sendSuccess(res, user, 'User registered successfully', 201);
    } catch (error) {
        sendError(res, (error as Error).message, 500);
    }
};

// Login Controller
const loginController = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            sendError(res, 'Email and password are required', 400);
            return;
        }

        // Fetch user from Supabase
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, password, name, role')
            .eq('email', email)
            .limit(1);

        if (error || !users || users.length === 0) {
            sendError(res, 'Invalid credentials', 401);
            return;
        }

        const user = users[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            sendError(res, 'Invalid credentials', 401);
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })
        const { password: _, ...userWithoutPassword } = user;
        sendSuccess(res, userWithoutPassword, 'User logged in successfully', 200);
    } catch (error) {
        sendError(res, (error as Error).message, 500);
    }
};

const logoutController = async (req: express.Request, res: express.Response) => {
    res.clearCookie('token');
    sendSuccess(res, null, 'User logged out successfully', 200);
};

export { registerController, loginController, logoutController };