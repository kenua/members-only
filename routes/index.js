const express = require('express')
const router = express.Router()
const { 
  checkSchema,
  validationResult,
  matchedData,
  body
} = require('express-validator')
const { 
  signupValidationSchema,
  loginValidationSchema
} = require('../utils/validationSchemas')
const User = require('../models/user')
const Message = require('../models/message')
const { generatePassword } = require('../utils/password')
const passport = require('passport')

router.get('/', async (req, res, next) => {
  const messages = await Message.find().populate('author').exec()

  res.render('homePage', { user: req.user, messages: messages })
})

router.get('/signup', (req, res, next) => {
  res.render('signupPage')
})

router.post('/signup', 
  checkSchema(signupValidationSchema, ['body']), 
  async (req, res, next) => {
    const sendBack = (errorMessages) => {
      return res.render('signupPage', {
        userData: {
          first: req.body.first,
          last: req.body.last,
          email: req.body.email,
        },
        errorMessages: errorMessages,
      })
    }
    const result = validationResult(req)

    // Send back to form if validation fails
    if (!result.isEmpty()) {
      const mappedResult = result.mapped()
      const mappedErrors = {}

      for (let key in mappedResult) {
        mappedErrors[key] = mappedResult[key].msg
      }

      return sendBack(mappedErrors)
    }

    // Send back to form if passwords do not match
    if (req.body.password !== req.body.confirmpassword) {
      return sendBack({ confirmpassword: 'Passwords do not match.' })
    }

    // Send back to form if admin passcode does not match
    if (req.body.adminpasscode.length > 0 &&
      req.body.adminpasscode !== process.env.ADMINPASSCODE) {
        return sendBack({ adminpasscode: 'Wrong admin passcode' })
    }
    
    // Create new user doc
    let data = matchedData(req)
    let { salt, hash } = generatePassword(data.password)
    let newUser = new User({
      first: data.first,
      last: data.last,
      email: data.email,
      member: false,
      admin: (req.body.adminpasscode.length > 0) ? true : false,
      salt: salt,
      hash: hash,
    })

    try {
      await newUser.save()
    res.redirect('/login')
    } catch (err) {
      console.log(err)
      next(err)
    }
  }
)

router.get('/login', (req, res, next) => {
  res.render('loginPage', { noUser: req.session.messages })
})

router.post('/login', 
  checkSchema(loginValidationSchema, ['body']),
  (req, res, next) => {
    const result = validationResult(req)

    // send back to login page if there's an error
    if (!result.isEmpty()) {
      const mappedResult = result.mapped()
      const mappedErrors = {}

      for (let key in mappedResult) {
        mappedErrors[key] = mappedResult[key].msg
      }

      return res.render('loginPage', { 
        email: req.body.email,
        errorMessages: mappedErrors     
      })
    }

    return next()
  },
  passport.authenticate('local', { 
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureMessage:
      'There is no such user in our database. Please sign up first before logging in.',
  })
)

router.get('/joinclub', async (req, res, next) => {
  // kick out client if it's an admin, member, or unregistered user
  if (!req.user) return res.redirect('/')
  if (req.user && req.user.member) return res.redirect('/')
  if (req.user && req.user.admin) return res.redirect('/')

  res.render('joinClubForm')
})

router.post('/joinclub', 
  body('passcode')
    .notEmpty()
    .withMessage('This field cannot be empty.')
    .trim(),
  async (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.render(
        'joinClubForm', 
        { errorMessage: result.mapped().passcode.msg }
      )
    }

    if (req.body.passcode !== process.env.CLUBPASSCODE) {
      return res.render(
        'joinClubForm', 
        { errorMessage: 'Wrong passcode.' }
      )
    }

    await User.updateOne({ _id: req.user._id }, { member: true }).exec()
    return res.redirect('/')
  }
)

router.get('/create', (req, res, next) => {
  // kick out client if it's an unregistered user
  if (!req.user) return res.redirect('/')

  res.render('messageFormPage', { userid: req.user._id })
})

router.post('/create', 
  body('messagebody')
    .notEmpty()
    .withMessage('This field cannot be empty.')
    .trim()
    .isLength({min: 1})
    .withMessage('Your message is too short. ;)'),
  async (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.render('messageFormPage', { 
        userid: req.user._id,
        errorMessage: result.mapped().messagebody.msg,
      })
    }

    try {
      const newMessage = new Message({
        author: req.body.userid,
        message: req.body.messagebody.replace(/[\<\>]/g, ''),
      })
  
      await newMessage.save()
      return res.redirect('/')
    } catch (err) {
      return next(err)
    }
  }
)

router.get('/delete/:id', async (req, res, next) => {
  try {
    await Message.deleteOne({ _id: req.params.id })
    res.redirect('/')
  } catch (err) {
    next(err)
  }
})

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')
  })
})

module.exports = router