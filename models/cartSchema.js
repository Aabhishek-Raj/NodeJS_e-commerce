const mongoose = require('mongoose')

// const products = new mongoose.Schema({

// })

const cartSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true

  },
  total: {
    type: Number,
    default: 0,
    required: true
  },

  products: [{
    items: mongoose.Schema.Types.ObjectId,
    quantity: Number
  }]
})

const Cart = mongoose.model('cart', cartSchema)

module.exports = Cart
