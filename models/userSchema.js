const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const Product = require('./productSchema')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter the username'],
    unique: true,
    minlength: [4, 'Username must be minimum 4 char']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [4, 'Password must be atlest 4 characters']

  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please enter an email'],
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']

  },
  phoneNo: {
    type: String,
    required: [true, 'Please enter your phone number'],
    minlength: [10, 'please enter a valid Phone numder']

  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product'

  }],
  addresses: [{
    house: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    apartment: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    },
    country: {
      type: String,
      required: true
    }

  }]
})

userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email })

  if (user) {
    const auth = await bcrypt.compare(password, user.password)
    if (auth) {
      if (user.isBlocked === false) {
        return user
      }
      throw Error('Your Account is Blocked')
    }
    throw Error('Incorrect password')
  }
  throw Error('Incorrect email Id')
}

const User = mongoose.model('user', userSchema)
module.exports = User
