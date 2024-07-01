const { 
  validationResult,
} = require('express-validator')
const User = require('../models/user')
const Message = require('../models/message')

module.exports.getHome = async (req, res, next) => {
  try {
    const messages = await Message.find().populate('author').exec()
  
    res.render('homePage', { user: req.user, messages: messages })
  } catch (err) {
    next(err)
  }
}

module.exports.getJoinClub = async (req, res, next) => {
  res.render('joinClubForm')
}

module.exports.postJoinClub = async (req, res, next) => {
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

module.exports.getMessageForm = (req, res, next) => {
  res.render('messageFormPage', { userid: req.user._id })
}

module.exports.postMessageForm = async (req, res, next) => {
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

module.exports.getDeleteMessage = async (req, res, next) => {
  try {
    await Message.deleteOne({ _id: req.params.id })
    return res.redirect('/')
  } catch (err) {
    return next(err)
  }
} 