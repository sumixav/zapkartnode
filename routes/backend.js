const express = require('express');
const router = express.Router();

const UserController = require('../controllers/backend/user.controller');
const UserGroupController = require('../controllers/backend/userGroup.controller');
const MerchantController = require('../controllers/backend/merchant.controller');
const ShippingRateController = require('../controllers/backend/shippingRate.controller');
const ReviewsController = require('../controllers/backend/review.controller');
const BusinessLocationController = require('../controllers/backend/businessLocation.controller');
const GeoLocationController = require('../controllers/backend/geolocation.controller');
const CartController = require('../controllers/backend/cart.controller');
const CoupenController = require('../controllers/backend/coupen.controller');
const PaymentController = require('../controllers/backend/payment.controller');
const OrderController = require('../controllers/backend/order.controller');
const ShipmentController = require('../controllers/backend/shipment.controller');
const Validate = require('../services/validate');
const multer = require('multer')

const formupload = multer()
const passport = require('passport');
const path = require('path');
const { upload } = require('../middleware/upload')
const multerUpload = require('multer')()
const userUpload = upload('users').fields([{ name: 'avatarlocation' }])
const prescriptionUpload = upload('prescriptions').fields([{ name: 'prescription', maxCount: 5 }])

require('./../middleware/passport')(passport)
const checkIsRole = require('./../middleware/checkRole')



/* GET Heart Beat. */
router.get('/get-heart-beat-admin', function (req, res, next) {
  res.json({ status: "success", message: "Zapkart API", data: { "version_number": "v1.0.0" } })
});

router.post('/users/register', userUpload, Validate.registerUser, UserController.create);
router.post('/users/login', formupload.none(), UserController.login);
router.patch('/users/update', userUpload, passport.authenticate('jwt', { session: false }), UserController.update);
router.get('/users', passport.authenticate('jwt', { session: false }), UserController.getUser);
router.get('/usersperpage/:pagelimit/:offset', passport.authenticate('jwt', { session: false }), UserController.getUserPerPage);
router.post('/userGroup/create/:role', formupload.none(), passport.authenticate('jwt', { session: false }), UserGroupController.create);
router.get('/userGroup/list/:role', passport.authenticate('jwt', { session: false }), UserGroupController.getAllUserGroup);
router.get('/userGroup/:id', passport.authenticate('jwt', { session: false }), UserGroupController.getUserGroup);
router.patch('/userGroup/updateuserGroup/:id', formupload.none(), passport.authenticate('jwt', { session: false }), UserGroupController.updateUserGroup);

router.post('/merchant/create', passport.authenticate('jwt', { session: false }), formupload.none(), MerchantController.create);
router.get('/merchant', MerchantController.getAllMerchant);
router.get('/merchant/:id', MerchantController.getMerchant);
router.patch('/updatemerchant/:id', formupload.none(), MerchantController.updateMerchant);

router.get('/shippingRate/', ShippingRateController.getAllShippingRates);
router.post('/shippingRate/create', formupload.none(), ShippingRateController.createshippingRate);
router.get('/shippingRate/:id', ShippingRateController.getshippingRate);
router.patch('/shippingRate/:id', formupload.none(), ShippingRateController.editshippingRates);
router.delete('/shippingRate/:id', ShippingRateController.deleteshippingRate);
router.patch('/shippingRate/restore/:id', ShippingRateController.restoreShippingRate);

// reviews
router.post('/reviews/create', passport.authenticate('jwt', { session: false }), formupload.none(), ReviewsController.addReview);
router.get('/reviews/product/:productId', ReviewsController.getProductReviews);
router.get('/reviews/user', passport.authenticate('jwt', { session: false }), ReviewsController.getUserReviews);
router.get('/reviews/user/:userId', passport.authenticate('jwt', { session: false }), ReviewsController.getUserReviews);
router.patch('/reviews/edit/:reviewId/', passport.authenticate('jwt', { session: false }), formupload.none(), ReviewsController.editReview);
router.patch('/reviews/edit/:reviewId/:userId', passport.authenticate('jwt', { session: false }), formupload.none(), ReviewsController.editReview);
router.delete('/reviews/delete/:reviewId', passport.authenticate('jwt', { session: false }), ReviewsController.deleteReview);
router.delete('/reviews/delete/:reviewId/:userId', passport.authenticate('jwt', { session: false }), ReviewsController.deleteReview);
router.patch('/reviews/restore/:reviewId/', passport.authenticate('jwt', { session: false }), ReviewsController.restoreReview);
router.patch('/reviews/restore/:reviewId/:userId', passport.authenticate('jwt', { session: false }), ReviewsController.restoreReview);

router.get('/businessLocation/', BusinessLocationController.getAllbusinessLocations);
router.post('/businessLocation/create', formupload.none(), BusinessLocationController.createbusinessLocation);
router.get('/businessLocation/:id', BusinessLocationController.getbusinessLocation);
router.patch('/businessLocation/:id', formupload.none(), BusinessLocationController.editbusinessLocations);
router.delete('/businessLocation/:id', BusinessLocationController.deletebusinessLocation);
router.patch('/businessLocation/restore/:id', BusinessLocationController.restorebusinessLocation);

router.get('/country', GeoLocationController.getAllCountry);
router.get('/state/:id', GeoLocationController.getState);
router.get('/city/:id', GeoLocationController.getCity);


// router.post('/cart/create', formupload.none(), passport.authenticate('jwt', { session: false }), CartController.create);
router.post('/cart/addToCart', formupload.none(), passport.authenticate('jwt', { session: false }), CartController.addToCart);
router.post('/cart/addMultipleToCart', passport.authenticate('jwt', { session: false }), CartController.addToCartGuestToLogged);
router.post('/cart/removeFromCart', formupload.none(), passport.authenticate('jwt', { session: false }), CartController.removeFromCart);
router.post('/cart/restoreToCart', passport.authenticate('jwt', { session: false }), CartController.restoreToCart);
router.get('/cart', passport.authenticate('jwt', { session: false }), CartController.getCart);
router.patch('/updatecart/:id', formupload.none(), CartController.updateCart);
router.delete('/deletecart/:id', formupload.none(), CartController.deleteCart);

router.get('/users/all', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), UserController.getUsers);
router.post('/users/fblogin', formupload.none(), UserController.fblogin);
router.post('/users/gblogin', formupload.none(), UserController.gblogin);
router.post('/users/forgotPassword', formupload.none(), Validate.forgotPassword, UserController.forgotPassword);
router.patch('/users/updatePassword', passport.authenticate('jwt', { session: false }), formupload.none(), Validate.updatePassword, UserController.updatePassword);
router.patch('/users/updatePasswordViaEmail', formupload.none(), Validate.updatePasswordEmail, UserController.updatePasswordViaEmail);
router.post('/users/verifyPassword', passport.authenticate('jwt', { session: false }), formupload.none(), UserController.verifyPassword);
router.post('/users/uploadPrescription', passport.authenticate('jwt', { session: false }), prescriptionUpload, Validate.prescriptionUpload, UserController.savePrescriptions);
router.get('/users/getPrescriptions', passport.authenticate('jwt', { session: false }), UserController.getPrescriptionsFromUser);
router.patch('/users/updatePrescriptions', passport.authenticate('jwt', { session: false }), prescriptionUpload, UserController.updatePrescriptions);
// req method to set validation - edit/ add/ delete
router.post('/users/address/create', passport.authenticate('jwt', { session: false }), formupload.none(), Validate.validateAddress, UserController.addAddress);
router.patch('/users/address/restore/:addressId', passport.authenticate('jwt', { session: false }), formupload.none(), UserController.restoreAddress);
router.patch('/users/address/:addressId', passport.authenticate('jwt', { session: false }), formupload.none(), Validate.validateAddress, UserController.editAddress);
router.delete('/users/address/:addressId', passport.authenticate('jwt', { session: false }), formupload.none(), UserController.deleteAddress);
router.get('/users/address', passport.authenticate('jwt', { session: false }), UserController.getAddressesromUser);

// users wishlist
router.post('/users/wishlist/add', passport.authenticate('jwt', { session: false }), formupload.none(), UserController.addToWishlist);
router.delete('/users/wishlist/delete', passport.authenticate('jwt', { session: false }), formupload.none(), UserController.removeFromWishlist);
router.get('/users/wishlist', passport.authenticate('jwt', { session: false }), UserController.getWishlist);
router.get('/users/wishlist/:userId', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), UserController.getWishlist);
router.get('/users/:userId', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), UserController.getUserDetails);

router.post('/coupen/create', formupload.none(), CoupenController.create);
router.get('/coupen', CoupenController.getAllCoupen);
router.get('/coupen/:id', CoupenController.getCoupen);
router.patch('/updatecoupen/:id', formupload.none(), CoupenController.updateCoupen);
router.get('/coupensection', CoupenController.getAllCoupenSection);
router.get('/paymentmethod', PaymentController.getPaymentMethod);
router.get('/coupenDetail/:name', passport.authenticate('jwt', { session: false }), CoupenController.getCoupenDetails);

// orders
router.post('/order/create', passport.authenticate('jwt', { session: false }), formupload.none(), OrderController.create);
router.get('/order/all', passport.authenticate('jwt', { session: false }), checkIsRole('admin','merchant'), OrderController.getAllOrders);
router.get('/order', passport.authenticate('jwt', { session: false }), OrderController.getUserOrders);
// n
router.patch('/order/orderItem/:orderItemId', passport.authenticate('jwt', { session: false }), formupload.none(), OrderController.updateOrderItem);
router.get('/order/user/:userId', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), OrderController.getUserOrders);
router.post('/order/update/:orderId/add-order-item', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), formupload.none(), OrderController.addOrderItem);
router.patch('/order/update/:orderId', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), formupload.none(), OrderController.updateOrderAdmin);

router.post('/order/update', passport.authenticate('jwt', { session: false }), formupload.none(), OrderController.update);
// n
router.post('/order/assign', passport.authenticate('jwt', { session: false }), checkIsRole('admin'),formupload.none(), OrderController.assignMerchantToOrder);
router.delete('/order/assign', passport.authenticate('jwt', { session: false }), checkIsRole('admin'),formupload.none(), OrderController.deleteAssignedMerchantToItem);
// router.patch('/order/assign/:merchantOrderId', passport.authenticate('jwt', { session: false }), checkIsRole('admin'),formupload.none(), OrderController.updateAssignedMerchantToOrder);
router.get('/order/:orderId', passport.authenticate('jwt', { session: false }), checkIsRole('admin'), OrderController.getOrderDetails);

// shipments
router.post('/shipment/create', passport.authenticate('jwt', { session: false }), formupload.none(), ShipmentController.createShipment);
router.get('/shipment/all', passport.authenticate('jwt', { session: false }), ShipmentController.getShipments);
router.get('/shipment/:shipmentId', passport.authenticate('jwt', { session: false }), ShipmentController.getShipmentDetails);
router.patch('/shipment/:shipmentId', passport.authenticate('jwt', { session: false }), formupload.none(), ShipmentController.editShipment);
// router.get('/shipment/unshipped/:masterOrderId', passport.authenticate('jwt', { session: false }), ShipmentController.getUnshippedOrderItems);
router.get('/shipment/unshipped/:masterOrderId', passport.authenticate('jwt', { session: false }), ShipmentController.getUnshippedOrderItems);


module.exports = router;
