const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please add all the details about your product']
  },
  price: {
    type: String,
    required: true
  },
  offer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: String,
    required: true
  },
  imageurl: {
    type: String,
    required: true
  },
  imageurl2: {
    type: String,
    required: true
  },
  discription: {
    type: String,
    required: true
  }
})

const Product = mongoose.model('product', productSchema)

module.exports = Product
