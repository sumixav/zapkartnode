const express = require('express');
const router = express.Router();
const UserController 	    = require('../controllers/backend/user.controller');
const MerchantTypeController 	    = require('../controllers/backend/merchantType.controller');
const MerchantController 	    = require('../controllers/backend/merchant.controller');
const GeoLocationController 	    = require('../controllers/backend/geolocation.controller');
const CartController 	    = require('../controllers/backend/cart.controller');
const Validate                    = require('../services/validate');
const multer  = require('multer')
const formupload = multer()
const passport = require('passport');
const path = require('path');
const { upload } = require('../middleware/upload')
const multerUpload = require('multer')()
const userUpload = upload('users').fields([{ name: 'avatarlocation' }])

require('./../middleware/passport')(passport)



/* GET Heart Beat. */
router.get('/get-heart-beat-admin', function (req, res, next) {
  res.json({ status: "success", message: "Zapkart API", data: { "version_number": "v1.0.0" } })
});

router.post(  '/users/register'     , userUpload, Validate.registerUser, UserController.create); 
router.post(  '/users/login'        , formupload.none(),UserController.login);
router.patch(  '/users/update'        , userUpload, Validate.validateAuth, UserController.update);
router.get(   '/users'          , passport.authenticate('jwt', {session:false}), UserController.getUser);
router.post(  '/merchanttype/create', formupload.none(), MerchantTypeController.create);
router.get(  '/merchanttype', MerchantTypeController.getAllMerchantType);
router.get(   '/merchanttype/:id' ,MerchantTypeController.getMerchantType);
router.patch(  '/updatemerchanttype/:id'  ,formupload.none(), MerchantTypeController.updateMerchantType);

router.post(  '/merchant/create', formupload.none(),MerchantController.create);
router.get(  '/merchant', MerchantController.getAllMerchant);
router.get(   '/merchant/:id' ,MerchantController.getMerchant);
router.patch(  '/updatemerchant/:id'  ,formupload.none(), MerchantController.updateMerchant);

router.get('/country', GeoLocationController.getAllCountry);
router.get('/state/:id', GeoLocationController.getState);
router.get('/city/:id', GeoLocationController.getCity);

router.post(  '/cart/create', formupload.none(),passport.authenticate('jwt', {session:false}),CartController.create);
router.get(   '/cart' ,passport.authenticate('jwt', {session:false}),CartController.getCart);
router.patch(  '/updatecart/:id'  ,formupload.none(), CartController.updateCart);
router.delete(  '/deletecart/:id'  ,formupload.none(), CartController.deleteCart);
module.exports = router;
