import express from 'express'
import dotenv from 'dotenv'
import authRoutes from "./routes/authRoutes"
import authMiddleware from './middleware/auth'


// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 5000

app.use('/api/auth', authRoutes)
// test route for protected route
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'You have accessed a protected route', user: req.user })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
