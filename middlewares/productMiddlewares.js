const Cart = require('../models/cartSchema')
const User = require('../models/userSchema')
const multer = require('multer')

const cartCount = async (req, res, next) => {
  let counts = null
  if (req.user) {
    const cart = await Cart.findOne({ user: req.user.id })
    if (cart) {
      counts = cart.products.length
    }
  }
  res.locals.counts = counts
  next()
}

const wishCount = async (req, res, next) => {
  let wCounts = null
  if (req.user) {
    const user = await User.findOne({ _id: req.user.id })
    if (user) {
      wCounts = user.wishlist.length
    }
  }
  res.locals.wCounts = wCounts
  next()
}

const offcCart = async (req, res, next) => {
  let cartItems = null
  if (req.user) {
    try {
      const userId = req.user.id
      cartItems = await Cart.aggregate([
        {
          $match: { user: userId }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            items: '$products.items',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items',
            foreignField: '_id',
            as: 'productDetails'
          }
        }
      ])
      // console.log(cartItems[0].productDetails)
    } catch (err) {
      console.log(err)
    }
  }
  res.locals.cartItems = cartItems
  next()
}

const offcWish = async (req, res, next) => {
  let products = null
  if (req.user) {
    const userId = req.user.id
    try {
      const wish = await User.findById({ _id: userId })
        .populate('wishlist')
      // .execPopulate()
      // const result = await findById({})
      // res.render('')
      products = wish.wishlist
    } catch (err) {
      console.log(err)
    }
  }
  res.locals.products = products
  next()
}

const filesStragEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  }
})
const upload = multer({ storage: filesStragEngine })

module.exports = { cartCount, wishCount, offcCart, offcWish, upload }
