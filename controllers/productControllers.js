const Product = require('../models/productSchema')
const Cart = require('../models/cartSchema')
const User = require('../models/userSchema')
const Order = require('../models/orderSchema')
const objId = require('mongodb').ObjectId
const { findById } = require('../models/productSchema')

module.exports.viewproduct_get = async (req, res) => {
  const products = await Product.find({})
  res.render('user/view-products', { product: products })
}

module.exports.singleproduct_get = async (req, res) => {
  const prodId = req.params.prodId
  try {
    const products = await Product.findById(prodId)
    res.render('user/single-productView', { product: products })
  } catch (err) {
    console.log(err + ' single product view not allowed')
  }
}

module.exports.addToCart_get = async (req, res) => {
  const prodId = req.params.prodId
  const userId = req.user.id
  const prodPrice = req.params.price

  const proObj = {
    items: prodId,
    quantity: 1
  }

  const userCart = await Cart.findOne({ user: userId })
  if (userCart) {
    const tot = userCart.total += parseInt(prodPrice)
    await Cart.findOneAndUpdate({ user: userId }, { total: tot })
    const proExist = userCart.products.findIndex(products => products.items == prodId)
    if (proExist !== -1) {
      await Cart.updateOne({ user: userId, 'products.items': prodId },
        {
          $inc: { 'products.$.quantity': 1 }
        })
      console.log(userCart.total)
      // total += prodPrice
      res.redirect('/')
    } else {
      await Cart.updateOne({ user: userId }, {
        $push: { products: proObj }
      })
      res.redirect('/')
    }
  } else {
    const cartobj = {
      user: userId,
      total: prodPrice,
      products: [proObj]

    }
    // cartobj.products.push(proObj)
    await Cart.create(cartobj)

    res.redirect('/')
  }
}

module.exports.cart_get = async (req, res) => {
  try {
    const userId = req.user.id
    const cart = await Cart.findOne({ user: userId })
    const cartItems = await Cart.aggregate([
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
    // console.log(cartItems[0].cartItems)
    res.render('user/cart', { cartItems, carttotal: cart.total })
  } catch (err) {
    res.render('user/emptyCart')
  }
}

module.exports.deleteFromCart_get = async (req, res) => {
  const prodId = req.params.id
  const userId = req.user.id
  const prodPrice = req.params.price

  const userCart = await Cart.findOne({ user: userId, items: prodId })
  // const tot = userCart.total -= parseInt(prodPrice)
  // await Cart.updateOne({ user: userId }, { $set: { 'total.$': {total -= (prodPrice * product.quantity) } })
  const finded = await Cart.findOne({ user: userId }, { products: { $elemMatch: { items: prodId } } })
  const tot = userCart.total -= parseInt(prodPrice) * (finded.products[0].quantity)
  await Cart.findOneAndUpdate({ user: userId }, { total: tot })
  // const proExist = userCart.products.findIndex(products => products.items == prodId)
  // if (proExist >= 0) {
  await Cart.updateOne({ user: userId }, { $pull: { products: { items: prodId } } })
  // await Cart.updateOne({ user: userId }, {
  //   $push: { products: proObj }
  // // }
  //
  // 0
  // console.log(dCart)
  // await dCart.splice({ user: userId, 'products.items': prodId })
  res.redirect('/cart')
}

module.exports.addToWishlist_Get = async (req, res) => {
  try {
    const userId = req.user.id
    const prodId = req.params.id
    const user = await User.findOne({ _id: userId })
    if (user.wishlist.length !== 0) {
      const isExisting = user.wishlist.findIndex(wishlist => wishlist == prodId)
      if (isExisting === -1) {
        await user.updateOne({ $push: { wishlist: prodId } })
        res.redirect('/')
      } else { res.redirect('/') }
    } else {
      await user.updateOne({ $push: { wishlist: prodId } })
      res.redirect('/')
    }
  } catch (err) {
    res.render('user/error')
  }
}

module.exports.viewWishlist_Get = async (req, res) => {
  const userId = req.user.id
  try {
    const wish = await User.findById({ _id: userId })
      .populate('wishlist')
    // .execPopulate()
    // const result = await findById({})
    res.render('user/wishlist', { products: wish.wishlist })
    // res.render('')
  } catch (err) {
    console.log(err)
  }
}

module.exports.deleteFromWishlist_Get = async (req, res) => {
  const userId = req.user.id
  const prodId = req.params.id
  await User.updateOne({ _id: userId }, { $pull: { wishlist: prodId } })
  res.redirect('/wishlist')
}

module.exports.checkoutPage_Get = async (req, res) => {
  const userId = req.user.id
  const cart = await Cart.findOne({ user: userId })
  const cartItems = await Cart.aggregate([
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
  res.render('user/checkoutPage', { cartItems, carttotal: cart.total })
}

module.exports.checkoutPage_Post = async (req, res) => {
  // const userId = req.user.id
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    const total = cart.total
    const products = cart.products
    const status = req.body.paymentmethod === 'COD' ? 'placed' : 'pending'

    const orderObj = {
      deliveryDetails: {
        house: req.body.housename,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        pincode: req.body.pin,
        state: req.body.state,
        country: req.body.country
      },
      userId: req.user.id,
      paymentmethod: req.body.paymentmethod,
      cartproducts: products,
      totalamount: total,
      phone: req.body.phone,
      orderstatus: status
    }
    await Order.insertMany(orderObj)
    await Cart.deleteOne({ user: req.user.id })
    res.json({ status: true })
  } catch (err) {
    console.log(err)
  }
}

module.exports.ordersuccess_Get = async (req, res) => {
  res.render('user/ordersuccess')
}
module.exports.viewOrderDetails_Get = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
  res.render('user/orderHistory', { orders })
}

module.exports.orderProductView_Get = async (req, res) => {
  const orderId = objId(req.params.orderId)
  const orderItems = await Order.aggregate([
    {
      $match: { _id: orderId }
    },
    {
      $unwind: '$cartproducts'
    },
    {
      $project: {
        items: '$cartproducts.items',
        quantity: '$cartproducts.quantity'
      }
    },
    {
      $lookup: {
        from: 'products',
        foreignField: '_id',
        localField: 'items',
        as: 'orderproductDetails'
      }
    },
    {
      $project: {
        items: 1, quantity: 1, product: { $arrayElemAt: ['$orderproductDetails', 0] }
      }
    }
  ])
  console.log(orderItems)
  res.render('user/orderProductView', { orderItems})
}
