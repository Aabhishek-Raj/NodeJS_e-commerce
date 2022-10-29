const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
  deliveryDetails: {
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

  },
  userId: mongoose.Schema.Types.ObjectId,
  paymentmethod: String,
  cartproducts: [],
  totalamount: Number,
  phone: Number,
  orderstatus: String

}, { timestamps: true })

const Order = mongoose.model('order', orderSchema)

module.exports = Order
