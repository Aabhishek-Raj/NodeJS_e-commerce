const Product = require('../models/productSchema')
const Cart = require('../models/cartSchema')
const User = require('../models/userSchema')
const Order = require('../models/orderSchema')
const objId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
require('dotenv').config()
const fetch = require('node-fetch')
const Coupon = require('../models/couponSchema')
const Admin = require('../models/adminSchema')
const base = 'https://api-m.sandbox.paypal.com'

const instance = new Razorpay({
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET
})

module.exports.viewproduct_get = async (req, res) => {
  const products = await Product.find({})
  const banners = await Admin.find({})
  res.render('user/view-products', { product: products, banners })
}

module.exports.singleproduct_get = async (req, res) => {
  const prodId = req.params.prodId
  try {
    const products = await Product.findById(prodId)
    const related = await Product.find({})
    res.render('user/single-productView', { product: products, related })
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
    //  cartobj.products.push(proObj)
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
    // console.log(cartItems[0].productDetails)
    res.render('user/cart', { cartItems, carttotal: cart.total })
  } catch (err) {
    res.render('user/emptyCart')
  }
}

// increment & decreament using fetch===>>

module.exports.deleteFromCart_get = async (req, res) => {
  const prodId = req.params.id
  const userId = req.user.id
  const prodPrice = req.params.price

  const userCart = await Cart.findOne({ user: userId, items: prodId })
  const finded = await Cart.findOne({ user: userId }, { products: { $elemMatch: { items: prodId } } })
  const tot = userCart.total -= parseInt(prodPrice) * (finded.products[0].quantity)
  await Cart.findOneAndUpdate({ user: userId }, { total: tot })

  await Cart.updateOne({ user: userId }, { $pull: { products: { items: prodId } } })
  res.redirect('/cart')
}

module.exports.changeProductQuantity = async (req, res) => {
  const details = req.body
  if (details.count == -1 && details.quandity == 1) {
    const userCart = await Cart.findOne({ _id: details.cartId, items: details.prodId })
    const tot = userCart.total -= parseInt(details.prodPrice) * (details.quandity)
    await Cart.findOneAndUpdate({ _id: details.cartId }, { total: tot })

    await Cart.updateOne({ _id: details.cartId }, { $pull: { products: { items: details.prodId } } })
    res.json({ removed: true })
  } else {
    const userCart = await Cart.findOne({ _id: details.cartId })
    if (userCart) {
      const tot = userCart.total += parseInt(details.prodPrice) * (details.count)
      await Cart.findOneAndUpdate({ _id: details.cartId }, { total: tot })

      await Cart.updateOne({ _id: details.cartId, 'products.items': details.prodId },
        {
          $inc: { 'products.$.quantity': details.count }
        })
    }
    res.json({ userCart })
  }
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
    const order = await Order.insertMany(orderObj)
    await Cart.deleteOne({ user: req.user.id })
    const orderId = '' + order[0]._id
    if (req.body.paymentmethod === 'COD') {
      res.json({ codSuccess: true, orderId })
    } else if (req.body.paymentmethod === 'RAZORPAY') {
      const options = {
        amount: (total + 50) * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: orderId
      }
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err)
        } else {
          res.json({ order, orderId })
        }
      })
    } else if (req.body.paymentmethod === 'PAYPAL') {
      res.json({ paypal: orderId, orderId })
      console.log('paypal activated')
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports.paypalOrder_Post = async (req, res) => {
  let total = req.body.total / 80
  total = (Math.round(total * 100) / 100).toFixed(2)
  const order = await createOrder(total)
  res.json(order)
}

module.exports.paypalVerify_Post = async (req, res) => {
  const orderID = req.params.orderID
  const captureData = await capturePayment(orderID)
  // TODO: store payment information such as the transaction ID
  res.json(captureData)
}
/// ///////////////////
// PayPal API helpers
/// ///////////////////

// use the orders api to create an order

async function createOrder (total) {
  const accessToken = await generateAccessToken()
  const url = `${base}/v2/checkout/orders`
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total
          }
        }
      ]
    })
  })
  const data = await response.json()
  return data
}

// use the orders api to capture payment for an order
async function capturePayment (orderId) {
  const accessToken = await generateAccessToken()
  const url = `${base}/v2/checkout/orders/${orderId}/capture`
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  const data = await response.json()
  return data
}

// generate an access token using client id and app secret
async function generateAccessToken () {
  const auth = Buffer.from(process.env.PaypalClientId + ':' + process.env.paypalClientSecret).toString('base64')
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`
    }
  })
  const data = await response.json()
  return data.access_token
}

module.exports.placingPaypalorder = async (req, res) => {
  await Order.updateOne({ _id: req.body.userOrderId },
    {
      $set: {
        orderstatus: 'Placed'
      }
    })
  res.json({ set: true })
}

module.exports.verifyPayment = async (req, res) => {
  const crypto = require('crypto')
  const orderId = req.body.order.receipt
  console.log(req.body.response.razorpay_payment_id)
  console.log(req.body.response.razorpay_order_id)
  try {
    const body = req.body.response.razorpay_order_id + '|' + req.body.response.razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', '5VoQkbJcikjEgyfclrnWYEVF')
      .update(body.toString())
      .digest('hex')
    console.log('sig received ', req.body.response.razorpay_signature)
    console.log('sig generated ', expectedSignature)
    if (expectedSignature === req.body.response.razorpay_signature) {
      res.json({ status: true })
      await Order.updateOne({ _id: orderId },
        {
          $set: {
            orderstatus: 'Placed'
          }
        })
    } else {
      res.json({ status: false, errMsg: '' })
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports.stockAndSalesChange = async (req, res) => {
  const { orderId } = req.body
  const orderItems = await Order.aggregate([
    {
      $match: { _id: objId(orderId) }
    },
    {
      $unwind: '$cartproducts'
    },
    {
      $project: {
        items: '$cartproducts.items',
        quantity: '$cartproducts.quantity'
      }
    }
  ])

  orderItems.forEach(async item => {
    await Product.findOneAndUpdate({ _id: item.items }, { $inc: { stock: item.quantity * -1, sales: item.quantity } })
  })
  res.status(200)
}

module.exports.ordersuccess_Get = async (req, res) => {
  res.render('user/ordersuccess')
}
module.exports.viewOrderDetails_Get = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
  res.render('user/orderHistory', { orders })
}
module.exports.userOrderCancel_Get = async (req, res) => {
  await Order.updateOne({ _id: req.params.id },
    {
      $set: {
        orderstatus: 'Cancelled'
      }
    })
  res.redirect('/vieworderdetails')
}
module.exports.userOrderreturn_Get = async (req, res) => {
  await Order.updateOne({ _id: req.params.id },
    {
      $set: {
        orderstatus: 'Return'
      }
    })
  res.redirect('/vieworderdetails')
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
  // console.log(orderItems)
  res.render('user/orderProductView', { orderItems })
}

module.exports.userAccount = async (req, res) => {
  const userId = req.user.id
  const user = await User.findOne({ _id: userId })
  res.render('user/userAccount', { user })
}

module.exports.applycoupon_post = async (req, res) => {
  console.log(req.body)
  const { coupon, total } = req.body
  console.log(coupon)
  const coupondata = await Coupon.findOne({ couponCode: coupon })
  console.log(coupondata)
  if (coupondata.users.length !== 0) {
    const isExisting = coupondata.users.findIndex(users => users == req.user.id)
    console.log(isExisting)
    if (total >= coupondata.minBill && isExisting === -1) {
      await Coupon.updateOne({ couponCode: coupon }, {
        $push: { users: req.user.id }
      })
      await Cart.updateOne({ user: req.user.id }, { $inc: { total: coupondata.couponValue * -1 } })
      const tot = parseInt(total) + coupondata.couponValue * -1
      res.json({ tot })
    } else {
      res.json({ error: true, msg: 'already used this coupon' })
      console.log('already used this coupon')
    }
  } else {
    if (total >= coupondata.minBill) {
      await Coupon.updateOne({ couponCode: coupon }, {
        $push: { users: req.user.id }
      })
      await Cart.updateOne({ user: req.user.id }, { $inc: { total: coupondata.couponValue * -1 } })
      const tot = parseInt(total) + coupondata.couponValue * -1
      res.json({ tot })
    } else {
      res.json({ error: true, msg: 'purchase amount is not enough' })
      console.log('purchase amount is not enough')
    }
  }
}
