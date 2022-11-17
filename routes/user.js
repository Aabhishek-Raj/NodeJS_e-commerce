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
router.post('/changequandity', productController.changeProductQuantity)

router.get('/add-to-wishlist/:id', productController.addToWishlist_Get)
router.get('/wishlist', authMiddlewares.requireAuth, productController.viewWishlist_Get)
router.get('/deletefromwishlist/:id', productController.deleteFromWishlist_Get)

router.get('/checkoutpage', productController.checkoutPage_Get)
router.post('/checkoutpost', productController.checkoutPage_Post)
router.post('/verify-payment', productController.verifyPayment)
router.post('/paypalorders', productController.paypalOrder_Post)
router.post('/paypalverify/:orderID/capture', productController.paypalVerify_Post)
router.post('/placingpayment', productController.placingPaypalorder)

router.post('/stockandsaleschange', productController.stockAndSalesChange)
router.get('/ordersuccess', productController.ordersuccess_Get)
router.get('/vieworderdetails', productController.viewOrderDetails_Get)
router.get('/orderproductview/:orderId', productController.orderProductView_Get)
router.get('/ordercancel/:id', productController.userOrderCancel_Get)
router.get('/orderreturn/:id', productController.userOrderreturn_Get)

router.get('/useraccount', productController.userAccount)
router.get('/addaddressform', productController.getAddressForm)
router.post('/addaddress', productController.addUserAddress)

router.post('/applycoupon', productController.applycoupon_post)

module.exports = router
