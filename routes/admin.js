const router = require('express').Router()
const adminProductController = require('../controllers/adminProductController')
const adminAuthController = require('../controllers/adminAuthController')
const { adminRequireAuth } = require('../middlewares/authMiddlewares')

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
router.post('/addproduct', adminProductController.addproduct_post)

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

module.exports = router
