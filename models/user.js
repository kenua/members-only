const mongoose = require('mongoose')

const User = new mongoose.Schema({
  first: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  last: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  email: {
    type: String,
    required: true,
    minLength: 5,
    unique: true,
  },
  member: {
    type: Boolean,
    required: true,
  },
  admin: {
    type: Boolean,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('User', User)