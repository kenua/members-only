require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const routes = require('./routes/index')

const app = express()
const PORT = process.PORT || 3000

// # MONGO CONFIG
mongoose
	.connect(process.env.MONGO_URL)
	.then(() => console.log('Connected to DB'))
	.catch(err => console.log('DB error: ' + err.message))

// # EXPRESS CONFIG
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'pug')

// # ROUTES
app.use(routes)

app.listen(PORT, () => console.log('App running on port ' + PORT))