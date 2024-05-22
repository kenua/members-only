const signupValidationSchema = {
  first: {
    trim: true,
    escape: true,
    toLowerCase: true,
    notEmpty: {
      errorMessage: 'This field cannot be empty.'
    },
    isLength: {
      options: { min: 2, max: 255 },
      errorMessage: 'This field needs to be at least 2 characters long, and no more than 255.',
    },
  },
  last: {
    trim: true,
    escape: true,
    toLowerCase: true,
    notEmpty: {
      errorMessage: 'This field cannot be empty.'
    },
    isLength: {
      options: { min: 2, max: 255 },
      errorMessage: 'This field needs to be at least 2 characters long, and no more than 255.',
    },
  },
  email: {
    isEmail: {
      errorMessage: 'Provide a valid email address',
    },
  },
  password: {
    notEmpty: {
      errorMessage: 'This field cannot be empty.'
    },
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password needs to be at least 8 characters long.',
    },
  },
  confirmpassword: {
    notEmpty: {
      errorMessage: 'This field cannot be empty.'
    },
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password confirmation needs to be at least 8 characters long.',
    },
  },
}

module.exports = {
  signupValidationSchema,
}