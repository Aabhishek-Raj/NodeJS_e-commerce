const Product = require('../models/productSchema')
const User = require('../models/userSchema')
const Category = require('../models/categorySchema')

module.exports.addproductform_get = async (req, res) => {
  const category = await Category.find({})
  res.render('admin/addProducts', { category, layout: './layouts/adminLayout' })
}

exports.addproduct_post = async (req, res) => {
  try {
    await Product.create(req.body)
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

  try {
    await Product.updateOne({ _id: prodId }, {
      $set: {
        name: req.body.name,
        price: req.body.price,
        offer: req.body.offer,
        category: req.body.category,
        stock: req.body.stock,
        imageurl: req.body.imageurl,
        imageurl2: req.body.imageurl2,
        description: req.body.description
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
