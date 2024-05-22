const express = require('express')
const router = express.Router()
const { checkSchema, validationResult, matchedData } = require('express-validator')
const { signupValidationSchema } = require('../utils/validationSchemas')

router.get('/', (req, res, next) => {
  res.render('homePage')
})

router.get('/signup', (req, res, next) => {
  res.render('signupPage')
})

router.post('/signup', 
  checkSchema(signupValidationSchema, ['body']), 
  (req, res, next) => {
    const result = validationResult(req)

    if (result.isEmpty()) {
      // VALIDATE PASSWORD & ADMIN PASSCODE
      // CREATE USER DOC
      // res.redirect('/login')
    }

    // Redirect back to sign up form
    const mappedResult = result.mapped()
    const mappedErrors = {}

    for (let key in mappedResult) {
      mappedErrors[key] = mappedResult[key].msg
    }

    res.render('signupPage', {
      userData: {
        first: req.body.first,
        last: req.body.last,
        email: req.body.email,
      },
      errorMessages: mappedErrors,
    })
    //console.log(req.body)
    //console.log(result)
  }
)

module.exports = router