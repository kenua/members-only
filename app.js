require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const { isPasswordValid } = require('./utils/password')
const routes = require('./routes/index')

const app = express()
const PORT = process.PORT || 3000

// # MONGO CONFIG
mongoose
	.connect(process.env.MONGO_URL)
	.then(() => console.log('Connected to DB'))
	.catch(err => console.log(err))

// # EXPRESS CONFIG
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'pug')

// # SESSION CONFIG
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	store: MongoStore.create({
		mongoUrl: process.env.MONGO_URL,
	}),
	cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // cookies expires in a week
}))

// PASSPORT CONFIG
const verify = new localStrategy(
	{ usernameField: 'email' },
	async (email, password, done) => {
		try {
			const user = await User.findOne({ email: email }).exec()

			if (!user) return done(null, false)

			if (isPasswordValid(password, user.hash, user.salt)) {
				return done(null, user)
			} else {
				return done(null, false)
			}

		} catch (err) {
			return done(err)
		}
	}
)

passport.use(verify)
passport.serializeUser((user, done) => {
	return done(null, user.id)
})
passport.deserializeUser(async (userId, done) => {
	try {
		const user = await User.findById(userId).exec()

		if (!user) throw new Error('User not found')

		return done(null, user)
	} catch (err) {
		return done(err)
	}
})

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
	res.locals.user = req.user
	next()
})

// # ROUTES
app.use(routes)

// # ERROR HANDLERS
app.use((req, res, next) => {
	let errorStatus = 404
	let errorMessage = 'Page not found. The resource your looking for does not exist!'

	res.status(errorStatus)
	res.render('error', { errorStatus, errorMessage })
})

app.use((err, req, res, next) => {
	let errorStatus = err.status || 500
	let errorMessage = err.message || 'Internal server error! Something went wrong. 🤕'

	res.status(errorStatus)
	res.render('error', { errorStatus, errorMessage })
})

app.listen(PORT, () => console.log('App running on port ' + PORT))