const router = require('express').Router()
const adminProductController = require('../controllers/adminProductController')
const adminAuthController = require('../controllers/adminAuthController')
const prodMiddlewares = require('../middlewares/productMiddlewares')

// admin authentication ===========>>

router.get('/adminsignup', adminAuthController.adminsignup_get)
router.post('/adminsignup', adminAuthController.adminsignup_post)
router.get('/adminlogin', adminAuthController.adminlogin_get)
router.post('/adminlogin', adminAuthController.adminlogin_post)

router.get('/adminlogout', adminAuthController.adminlogout_get)

// admin home =====================>>

router.get('/', (req, res) => {
  res.render('admin/adminHome', { layout: './layouts/adminLayout' })
})

// admin management ===============>>

router.get('/addproduct', adminProductController.addproductform_get)
router.post('/addproduct', prodMiddlewares.upload.array('images', 3), adminProductController.addproduct_post)

router.get('/productview', adminProductController.productview_get)

router.get('/deleteproduct/:id', adminProductController.productdelete_get)

router.get('/editproduct/:id', adminProductController.productEdit_get)
router.post('/editproduct', adminProductController.productEdit_post)

router.get('/usermanagement', adminProductController.userManagement_get)

router.get('/blockuser/:id', adminProductController.blockuser)
router.get('/unblockuser/:id', adminProductController.unblockuser)

router.get('/categorymanagement', adminProductController.categoryManagent_Get)
router.post('/categorymanagement', adminProductController.categorymanagement_Post)
router.get('/deletecategory/:id', adminProductController.deleteCategory_get)
router.post('/applycategoryoffer/:id', adminProductController.applyCategoryOffer)
router.get('/cancelcategoryoffer/:id', adminProductController.cancelCategoryOffer)

router.get('/ordermanagement', adminProductController.orderManagement)
router.post('/cancelorder/:id', adminProductController.cancelOrders)
router.get('/admindash', adminProductController.adminDashBoard_get)
router.get('/couponmange', adminProductController.couponManagement_Get)
router.post('/addcoupon', adminProductController.addCoupon_post)

router.get('/bannermangement', adminProductController.bannerManagement)
router.post('/addbannerimage', prodMiddlewares.upload.array('images', 3), adminProductController.addBannerImages)
router.post('/mainbannermanage', adminProductController.mainBannerUpload_post)
router.post('/leftbannermanage', adminProductController.leftBannerUpload_post)
router.post('/rightbannermanage', adminProductController.rightBannerUpload_post)

module.exports = router
