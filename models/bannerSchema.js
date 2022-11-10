const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bannerurl: {
    type: String
  }
})

const Banner = mongoose.model('banner', bannerSchema)

module.exports = Banner
