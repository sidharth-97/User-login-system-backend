dotenv.config()
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js' 
import connectDB from './config/db.js'

connectDB();
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api/users', userRoutes)
app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 8000

app.listen(port, () => console.log(`Connecting to server ${port}`))