const mongoose = require('mongoose')

const Message = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
  },
}, { timestamps: true })

module.exports = mongoose.model('Message', Message)