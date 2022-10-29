const router = require('express').Router()

const authControllers = require('../controllers/authControllers')
const authMiddlewares = require('../middlewares/authMiddlewares')
const productController = require('../controllers/productControllers')

// router.get('*', checkUser)

router.get('/', productController.viewproduct_get)

// Authentication Routes  ===============================>>

router.get('/signup', authMiddlewares.ifAuth, authControllers.signup_get)
router.post('/signup', authControllers.signup_post)

router.get('/login', authMiddlewares.ifAuth, authControllers.login_get)
router.post('/login', authControllers.login_post)

router.post('/sendnotification', authControllers.sendOtp)
router.post('/verify-otp', authControllers.otpVerification)

router.get('/logout', authControllers.logout_get)

// User management =====================================>>

router.get('/singleproductview/:prodId', productController.singleproduct_get)

router.get('/add-to-cart/:prodId/:price', authMiddlewares.requireAuth, productController.addToCart_get)
router.get('/cart', authMiddlewares.requireAuth, productController.cart_get)
router.get('/deletefromcart/:id/:price', productController.deleteFromCart_get)

router.get('/add-to-wishlist/:id', productController.addToWishlist_Get)
router.get('/wishlist', authMiddlewares.requireAuth, productController.viewWishlist_Get)
router.get('/deletefromwishlist/:id', productController.deleteFromWishlist_Get)

router.get('/checkoutpage', productController.checkoutPage_Get)
router.post('/checkoutpost', productController.checkoutPage_Post)

router.get('/ordersuccess', productController.ordersuccess_Get)
router.get('/vieworderdetails', productController.viewOrderDetails_Get)
router.get('/orderproductview/:orderId', productController.orderProductView_Get)

module.exports = router
