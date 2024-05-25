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
	.catch(err => console.log('DB error: ' + err.message))

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
	// maybe replace the id with the user's full name,
	// membership and admin status 🤔
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

// # ROUTES
app.use(routes)

app.listen(PORT, () => console.log('App running on port ' + PORT))