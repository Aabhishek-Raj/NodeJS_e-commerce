const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  offer: {
    type: Number,
    default: 0
  }

})

const Category = mongoose.model('category', categorySchema)

module.exports = Category
