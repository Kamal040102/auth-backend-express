// Dependencies
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
require('./config/Database.config')
const authRoute = require('./routes/Auth.route')

// Intialize App
const app = express()

// Middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())

// .env Imports
const PORT = process.env.PORT || 9999;
const URL = process.env.URL

// Routes
app.use('/api/auth', authRoute)

// Listener
app.listen(PORT, ()=>{
    console.log(`Serving on ${URL}:${PORT}`)
})