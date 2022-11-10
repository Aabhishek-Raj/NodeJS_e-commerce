
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const adminSchema = new mongoose.Schema({
  adminname: {
    type: String,
    required: [true, 'Please enter Admin name'],
    unique: true,
    minlength: [4, 'Admin name must be minimum 4 char']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [4, 'Password must be atlest 4 characters']

  },
  mainBanner: {
    type: String
  },
  mainBanner2: {
    type: String
  },
  leftBanner: {
    type: String
  },
  rightBanner: {
    type: String
  }
})

adminSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

adminSchema.statics.login = async function (adminname, password) {
  const admin = await this.findOne({ adminname })

  if (admin) {
    const auth = await bcrypt.compare(password, admin.password)
    if (auth) {
      return admin
    }
    throw Error('Incorrect password')
  }
  throw Error('Incorrect email Id')
}

const Admin = mongoose.model('admin', adminSchema)
module.exports = Admin
