const { 
  validationResult,
  matchedData
} = require('express-validator')
const User = require('../models/user')
const { generatePassword } = require('../utils/password')

// # /signup middleware
module.exports.getSignUp = (req, res, next) => {
  res.render('signupPage')
}

module.exports.postSignUp = async (req, res, next) => {
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

// # /login middleware
module.exports.getLogIn =  (req, res, next) => {
  res.render('loginPage', { noUser: req.session.messages })
}

module.exports.postLogIn = (req, res, next) => {
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
}

// # logout middleware
module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')
  })
}