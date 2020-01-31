const express = require('express');
const router = express.Router();
const UserController 	    = require('../controllers/backend/user.controller');
const MerchantTypeController 	    = require('../controllers/backend/merchantType.controller');
const MerchantController 	    = require('../controllers/backend/merchant.controller');
const Validate                    = require('../services/validate');
const multer  = require('multer')
const formupload = multer()
const passport = require('passport');
const path = require('path');

require('./../middleware/passport')(passport)


/* GET Heart Beat. */
router.get('/get-heart-beat-admin', function (req, res, next) {
  res.json({ status: "success", message: "Zapkart API", data: { "version_number": "v1.0.0" } })
});

router.post(  '/users/register'     , Validate.registerUser, UserController.create); 
router.post(  '/users/login'        , Validate.validateAuth, UserController.login);
router.post(  '/merchanttype/create', formupload.none(), MerchantTypeController.create);
router.get(  '/merchanttype', MerchantTypeController.getAllMerchantType);
router.get(   '/merchanttype/:id' ,MerchantTypeController.getMerchantType);
router.patch(  '/updatemerchanttype/:id'  ,formupload.none(), MerchantTypeController.updateMerchantType);

router.post(  '/merchant/create', formupload.none(),MerchantController.create);
router.get(  '/merchant', MerchantController.getAllMerchant);
router.get(   '/merchant/:id' ,MerchantController.getMerchant);
router.patch(  '/updatemerchant/:id'  ,formupload.none(), MerchantController.updateMerchant);

module.exports = router;
