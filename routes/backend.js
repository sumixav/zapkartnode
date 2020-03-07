const express = require('express');
const router = express.Router();
const UserController 	    = require('../controllers/backend/user.controller');
const UserGroupController 	    = require('../controllers/backend/userGroup.controller');
const MerchantController 	    = require('../controllers/backend/merchant.controller');
const GeoLocationController 	    = require('../controllers/backend/geolocation.controller');
const CartController 	    = require('../controllers/backend/cart.controller');
const CoupenController 	    = require('../controllers/backend/coupen.controller');
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
router.get(   '/usersperpage/:pagelimit/:offset'          , passport.authenticate('jwt', {session:false}), UserController.getUserPerPage);
router.post(  '/userGroup/create/:role', formupload.none(),passport.authenticate('jwt', {session:false}),  UserGroupController.create);
router.get(  '/userGroup/list/:role',passport.authenticate('jwt', {session:false}),  UserGroupController.getAllUserGroup);
router.get(   '/userGroup/:id' ,passport.authenticate('jwt', {session:false}), UserGroupController.getUserGroup);
router.patch(  '/userGroup/updateuserGroup/:id'  ,formupload.none(),passport.authenticate('jwt', {session:false}),  UserGroupController.updateUserGroup);

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
router.post(  '/users/fblogin', formupload.none(),UserController.fblogin);
router.post(  '/users/gblogin', formupload.none(),UserController.gblogin);

router.post(  '/coupen/create', formupload.none(),CoupenController.create);
router.get(  '/coupen', CoupenController.getAllCoupen);
router.get(   '/coupen/:id' ,CoupenController.getCoupen);
router.patch(  '/updatecoupen/:id'  ,formupload.none(), CoupenController.updateCoupen);

module.exports = router;
