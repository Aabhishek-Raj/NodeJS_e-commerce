const userSchema = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')

require('dotenv').config()
const client = require('twilio')(process.env.accountSid, process.env.authToken)

// const handleLoginErrors = (err) => {
//   console.log(err.message)
//   const error = { email: '', password: '' }
//   console.log(error)
// }

// Error handling function
const handleErrors = (err) => {
  console.log(err.message, err.code)
  const error = { username: '', email: '', password: '', phoneNo: '' }

  // Error hanling for login

  // inncorrect email
  if (err.message === 'Incorrect email Id') {
    error.email = 'That email is not registered'
    return error
  }

  // inncorrect password
  if (err.message === 'Incorrect password') {
    error.password = 'That password is not correct'
    return error
  }

  // Blocked by admin=============>>
  if (err.message === 'Your Account is Blocked') {
    error.email = 'Sorry !! You Have been BLOCKED by the admin'
    return error
  }

  // repetition of email-------->
  if (err.code === 11000) {
    error.email = 'YOU ALREADY HAVE AN ACCOUNT'

    return error
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message
    })
  }
  return error
}
const maxAge = 3 * 24 * 60 * 60

const createToken = (id) => {
  return jwt.sign({ id }, 'there is a secret', {
    expiresIn: maxAge
  })
}

module.exports.signup_get = (req, res) => {
  res.render('user/register')
}

module.exports.login_get = (req, res) => {
  res.render('user/login')
}

module.exports.signup_post = async (req, res) => {
  const { username, password, email, phoneNo } = req.body

  try {
    const user = await userSchema.create({ username, password, email, phoneNo })
    const token = createToken(user._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(201).json({ user })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(401).json({ errors })
  }
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body
  console.log(password)
  console.log('hi')
  try {
    const user = await userSchema.login(email, password)
    const token = createToken(user._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(200).json({ user: user._id })
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
}

module.exports.sendOtp = async (req, res) => {
  const data = req.body
  console.log(data.phoneNo)
  await client.verify.services(process.env.serviceId)
    .verifications
    .create({ to: `+91${req.body.phoneNo}`, channel: 'sms' })
    .then(verification => console.log(verification.status))
    .catch(e => {
      console.log(e)
      res.status(500).send(e)
    })
  res.sendStatus(200)
}

module.exports.otpVerification = async (req, res) => {
  console.log(req.body)
  const check = await client.verify.services(process.env.serviceId)
    .verificationChecks
    .create({ to: `+91${req.body.phoneNo}`, code: req.body.otp })
    .catch(e => {
      console.log(e)
      res.status(500).send(e)
    })
  console.log(check.status)
  if (check.status === 'approved') {
    const username = req.body.username
    await User.findOneAndUpdate({ username }, { isVerified: true })
  }
  res.status(200).json(check.status)
  console.log(check.status)
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 })
  res.redirect('/')
}

// admin authentication ============================>>
