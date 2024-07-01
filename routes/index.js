const express = require('express')
const router = express.Router()
const { 
  checkSchema,
  body
} = require('express-validator')
const { 
  signupValidationSchema,
  loginValidationSchema
} = require('../utils/validationSchemas')
const passport = require('passport')
const {
  getHome,
  getJoinClub,
  postJoinClub,
  getMessageForm,
  postMessageForm,
  getDeleteMessage
} = require('../controllers/main')
const { 
  getSignUp, 
  postSignUp,
  getLogIn,
  postLogIn,
  logOut
} = require('../controllers/auth')
const checkRole = require('../utils/checkRole')

router.get('/', getHome)

router.get('/signup', getSignUp)

router.post('/signup', 
  checkSchema(signupValidationSchema, ['body']), 
  postSignUp
)

router.get('/login', getLogIn)

router.post('/login', 
  checkSchema(loginValidationSchema, ['body']),
  postLogIn,
  passport.authenticate('local', { 
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureMessage:
      'There is no such user in our database. Please sign up first before logging in.',
  })
)

router.use('/joinclub', 
  checkRole({ user: true, admin: false, member: false }, '/')
)
router.get('/joinclub',
  getJoinClub
)

router.post('/joinclub', 
  body('passcode')
    .notEmpty()
    .withMessage('This field cannot be empty.')
    .trim(),
  postJoinClub
)

router.use('/create', checkRole({ user: true }))

router.get('/create', 
  getMessageForm
)

router.post('/create', 
  body('messagebody')
    .notEmpty()
    .withMessage('This field cannot be empty.')
    .trim()
    .isLength({min: 1})
    .withMessage('Your message is too short. ;)'),
  postMessageForm
)

router.get('/delete/:id', 
  checkRole({ user: true, admin: true }), 
  getDeleteMessage
)

router.get('/logout', logOut)

module.exports = router