const mongoose = require('mongoose')

const onbannerSchema = new mongoose.Schema({
  mainBanner: {
    type: String
  },
  leftBanner: {
    type: String
  },
  rightBanner: {
    type: String
  }
})

const Onbanner = mongoose.model('onbanner', onbannerSchema)

module.exports = Onbanner
