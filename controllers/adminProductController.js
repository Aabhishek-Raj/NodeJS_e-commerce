const Product = require('../models/productSchema')
const User = require('../models/userSchema')
const Category = require('../models/categorySchema')
const Order = require('../models/orderSchema')
const Coupon = require('../models/couponSchema')
const Banner = require('../models/bannerSchema')
const Admin = require('../models/adminSchema')

module.exports.addproductform_get = async (req, res) => {
  const category = await Category.find({})
  res.render('admin/addProducts', { category, layout: './layouts/adminLayout' })
}

exports.addproduct_post = async (req, res) => {
  console.log(req.body)
  const offer = req.body.orginalprice / 100 * req.body.offer
  try {
    const newObj = ({
      name: req.body.name,
      price: req.body.orginalprice - offer,
      orginalprice: req.body.orginalprice,
      offer: req.body.offer,
      category: req.body.category,
      stock: req.body.stock,
      imageurl: req.files[0].path,
      imageurl2: req.files[1].path,
      imageurl3: req.files[2].path,
      discription: req.body.discription
    })
    await Product.create(newObj)
    res.redirect('/admin/productview')
  } catch (err) {
    console.log(err)
  }
}

module.exports.productview_get = async (req, res) => {
  const products = await Product.find({})
  res.render('admin/productViews', { product: products, layout: './layouts/adminLayout' })
}

module.exports.productdelete_get = async (req, res) => {
  const proId = req.params.id
  await Product.deleteOne({ _id: proId })
  res.redirect('/admin/productview')

  console.log(proId)
}

module.exports.productEdit_get = async (req, res) => {
  const prodId = req.params.id
  const products = await Product.findById(prodId)
  const cate = await Category.find({})
  res.render('admin/edit-products', { product: products, cate, layout: './layouts/adminLayout' })
}

module.exports.productEdit_post = async (req, res) => {
  const prodId = req.body.id
  const offer = req.body.orginalprice / 100 * req.body.offer

  try {
    await Product.updateOne({ _id: prodId }, {
      $set: {
        name: req.body.name,
        price: req.body.orginalprice - offer,
        orginalprice: req.body.orginalprice,
        offer: req.body.offer,
        category: req.body.category,
        stock: req.body.stock,
        // imageurl: req.files[0].path,
        // imageurl2: req.files[1].path,
        // imageurl3: req.files[2].path,
        discription: req.body.discription
      }
    })
    res.redirect('/admin/productview')
  } catch (err) {
    console.log(err)
  }
}

module.exports.userManagement_get = async (req, res) => {
  const users = await User.find({})
  res.render('admin/userManagement', { user: users, layout: './layouts/adminLayout' })
}

module.exports.blockuser = async (req, res) => {
  const userId = req.params.id

  console.log(userId)
  await User.findByIdAndUpdate({ _id: userId }, { isBlocked: true })
  res.redirect('/admin/usermanagement')
}

module.exports.unblockuser = async (req, res) => {
  const userId = req.params.id
  await User.findByIdAndUpdate({ _id: userId }, { isBlocked: false })
  res.redirect('/admin/usermanagement')
}

module.exports.categoryManagent_Get = async (req, res) => {
  const category = await Category.find({})
  res.render('admin/categoryManagement', { category, layout: './layouts/adminLayout' })
}

module.exports.categorymanagement_Post = async (req, res) => {
  const category = req.body.category
  await Category.create({ category })
  res.redirect('/admin/categorymanagement')
}
module.exports.deleteCategory_get = async (req, res) => {
  const cateId = req.params.id
  await Category.deleteOne({ _id: cateId })
  res.redirect('/admin/categorymanagement')
}

module.exports.orderManagement = async (req, res) => {
  const allOrders = await Order.find({ $or: [{ orderstatus: 'Placed' }, { orderstatus: 'Delivered' }, { orderstatus: 'Dispatched' }, { orderstatus: 'Return' }] })
  res.render('admin/orderManagement', { allOrders, layout: './layouts/adminLayout' })
}

module.exports.cancelOrders = async (req, res) => {
  const status = req.body.status
  if (status === 'Cancel') {
    await Order.updateOne({ _id: req.body.id },
      {
        $set: {
          orderstatus: 'Cancelled'
        }
      })
  } else if (status === 'Dispatch') {
    await Order.updateOne({ _id: req.body.id },
      {
        $set: {
          orderstatus: 'Dispatched'
        }
      })
  } else if (status === 'Deliver') {
    await Order.updateOne({ _id: req.body.id },
      {
        $set: {
          orderstatus: 'Delivered'
        }
      })
  }

  res.redirect('/admin/ordermanagement')
}

module.exports.adminDashBoard_get = async (req, res) => {
  // const sales = await Product.aggregate([
  //   {
  //     $project: {
  //       sales: '$sales', _id: 0

  //     }
  //   }
  // ])
  // const finalArray = sales.map(function (obj) {
  //   return obj.sales
  // })
  // amount of sale ===>>
  const amount = await Order.aggregate([
    {
      $project: {
        amount: '$totalamount', _id: 0

      }
    }
  ])
  const amountArray = amount.map(function (obj) {
    return obj.amount
  })

  // time of sale==>>

  const time = await Order.aggregate([
    {
      $project: {
        time: '$createdAt', _id: 0

      }
    }
  ])
  const timeArray = time.map(function (obj) {
    return obj.time.toISOString().substring(0, 10)
  })
  const product = await Product.find({})

  res.render('admin/adminDashboard', { product, timeArray, amountArray, layout: './layouts/adminLayout' })
}

module.exports.couponManagement_Get = async (req, res) => {
  const coupons = await Coupon.find({})
  res.render('admin/couponManagement', { coupons, layout: './layouts/adminLayout' })
}
module.exports.addCoupon_post = async (req, res) => {
  await Coupon.insertMany(req.body)
  res.redirect('/admin/couponmange')
}

module.exports.applyCategoryOffer = async (req, res) => {
  const categoryId = req.params.id
  const category = await Category.findOneAndUpdate({ _id: categoryId }, { offer: req.body.offer })
  const prods = await Product.find({ category: category.category })
  prods.forEach(async (prod) => {
    console.log(Math.ceil(prod.orginalprice / 100 * req.body.offer) * -1)
    await Product.findByIdAndUpdate({ _id: prod._id }, { $inc: { price: Math.ceil(prod.orginalprice / 100 * req.body.offer) * -1 } })
  })
  res.redirect('/admin/categorymanagement')
}

module.exports.cancelCategoryOffer = async (req, res) => {
  const categoryId = req.params.id
  const category = await Category.findOne({ _id: categoryId })
  const prods = await Product.find({ category: category.category })
  prods.forEach(async (prod) => {
    console.log(Math.ceil(prod.orginalprice / 100 * category.offer))
    await Product.findOneAndUpdate({ _id: prod._id }, { $inc: { price: Math.ceil(prod.orginalprice / 100 * category.offer) } })
  })
  await Category.updateOne({ _id: categoryId }, { offer: 0 })
  res.redirect('/admin/categorymanagement')
}

module.exports.bannerManagement = async (req, res) => {
  const banner = await Banner.find({})
  res.render('admin/bannerManagement', { banner, layout: './layouts/adminLayout' })
}

exports.addBannerImages = async (req, res) => {
  console.log(req.body)
  try {
    const newObj = ({
      name: req.body.name,
      bannerurl: req.files[0].path
    })
    await Banner.create(newObj)
    res.redirect('/admin/bannermangement')
  } catch (err) {
    console.log(err)
  }
}
// bannerMangement ====>>

module.exports.mainBannerUpload_post = async (req, res) => {
  const { bannerId, bannerId2 } = req.body
  const banner = await Banner.findById({ _id: bannerId })
  const banner2 = await Banner.findById({ _id: bannerId2 })
  await Admin.updateOne({}, { mainBanner: banner.bannerurl })
  await Admin.updateOne({}, { mainBanner2: banner2.bannerurl })
  res.redirect('/admin/bannermangement')
}
module.exports.leftBannerUpload_post = async (req, res) => {
  const { bannerId } = req.body
  const banner = await Banner.findById({ _id: bannerId })
  await Admin.updateOne({}, { leftBanner: banner.bannerurl })
  res.redirect('/admin/bannermangement')
}
module.exports.rightBannerUpload_post = async (req, res) => {
  const { bannerId } = req.body
  const banner = await Banner.findById({ _id: bannerId })
  await Admin.updateOne({}, { rightBanner: banner.bannerurl })
  res.redirect('/admin/bannermangement')
}
