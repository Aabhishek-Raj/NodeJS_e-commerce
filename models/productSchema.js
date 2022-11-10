const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please add all the details about your product']
  },
  price: {
    type: Number
  },
  orginalprice: {
    type: Number,
    required: true
  },
  offer: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  sales: {
    type: Number,
    default: 0
  },
  imageurl: {
    type: String
  },
  imageurl2: {
    type: String
  },
  imageurl3: {
    type: String
  },
  discription: {
    type: String,
    required: true
  }
})

const Product = mongoose.model('product', productSchema)

module.exports = Product
