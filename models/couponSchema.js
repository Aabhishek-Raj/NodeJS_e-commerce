const mongoose = require('mongoose')
const Schema = mongoose.Schema

const couponSchema = new Schema({
  couponCode: {
    type: String,
    uppercase: true,
    required: true
  },
  couponValue: {
    type: Number,
    required: true
  },
  minBill: {
    type: Number,
    required: true
  },
  couponExpiry: {
    type: Date
  },
  status: {
    type: String,
    default: 'Active'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId
  }]

}, { timestamps: true })

const Coupon = mongoose.model('Coupon', couponSchema)
module.exports = Coupon
