function checkRole(
  { 
    user = null, 
    member = null, 
    admin = null,
  }, 
  redirectTo = null
) {
  return (req, res, next) => {
    let kickout = false

    if (user !== null && !(user === !!req.user)) {
      kickout = true 
    }

    if (member !== null && req.user && !(member === !!req.user.member)) {
      kickout = true  
    }

    if (admin !== null && req.user && !(admin === !!req.user.admin)) {
      kickout = true  
    }

    if (redirectTo) return res.redirect(redirectTo)

    if (kickout) {
      let error = new Error('Insufficient permissions 🖐️💂‍♂️')

      error.status = 403
      return next(error)
    }
    return next()
  }
}

module.exports = checkRole