const adminSchema = require('../models/adminSchema')
const jwt = require('jsonwebtoken')

// Error handling function
const handleError = (err) => {
  console.log(err.message, err.code)
  const error = { adminname: '', password: '' }

  // inncorrect email
  if (err.message === 'Incorrect email Id') {
    error.adminname = 'You are not an Admin'
    return error
  }

  // inncorrect password
  if (err.message === 'Incorrect password') {
    error.password = 'Your password is not correct'
    return error
  }

  // repetition of admin-------->
  if (err.code === 11000) {
    error.adminname = 'You are already an Admin'

    return error
  }

  // validation errors
  if (err.message.includes('admin validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message
    })
  }
  return error
}

const maxAge = 3 * 24 * 60 * 60

const createToken = (id) => {
  return jwt.sign({ id }, 'there is a admin secret', {
    expiresIn: maxAge
  })
}

module.exports.adminsignup_get = (req, res) => {
  res.render('admin/register', { layout: './layouts/adminLayout' })
}
module.exports.adminlogin_get = (req, res) => {
  res.render('admin/login', { layout: './layouts/adminLayout' })
}

module.exports.adminsignup_post = async (req, res) => {
  console.log('hi')
  const { adminname, password } = req.body

  try {
    const admin = await adminSchema.create({ adminname, password })
    const token = createToken(admin._id)
    res.cookie('jwtA', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(201).json({ admin: admin._id })
  } catch (err) {
    const errors = handleError(err)
    res.status(401).json({ errors })
  }
}

module.exports.adminlogin_post = async (req, res) => {
  console.log(req.body)
  const { adminname, password } = req.body
  console.log(password)
  console.log('hi')
  try {
    const admin = await adminSchema.login(adminname, password)
    const token = createToken(admin._id)
    res.cookie('jwtA', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(200).json({ admin: admin._id })
  } catch (err) {
    const errors = handleError(err)
    res.status(400).json({ errors })
  }
}

module.exports.adminlogout_get = (req, res) => {
  res.cookie('jwtA', '', { maxAge: 1 })
  res.redirect('/admin/adminlogin')
}
