const express = require('express');
const router = express.Router();
const UserController 	    = require('../controllers/backend/user.controller');
const MerchantTypeController 	    = require('../controllers/backend/merchantType.controller');
const MerchantController 	    = require('../controllers/backend/merchant.controller');
const custom = require('./../middleware/custom');
const Validate                    = require('../services/validate');

const passport = require('passport');
const path = require('path');

require('./../middleware/passport')(passport)

const { upload } = require('../middleware/upload')
const multerUpload = require('multer')()


/* GET Heart Beat. */
router.get('/get-heart-beat-admin', function (req, res, next) {
  res.json({ status: "success", message: "Zapkart API", data: { "version_number": "v1.0.0" } })
});

router.post(  '/users/register'     , Validate.registerUser, UserController.create); 
router.post(  '/users/login'        , Validate.validateAuth, UserController.login);
router.post(  '/merchanttype/create', MerchantTypeController.create);
router.get(  '/merchanttype', MerchantTypeController.getAllMerchantType);
router.get(   '/merchanttype/:id' ,MerchantTypeController.getMerchantType);
router.post(  '/updatemerchanttype/:id'  ,MerchantTypeController.updateMerchantType);

router.post(  '/merchant/create', MerchantController.create);
router.get(  '/merchant', MerchantController.getAllMerchant);
router.get(   '/merchant/:id' ,MerchantController.getMerchant);
router.post(  '/updatemerchant/:id'  ,MerchantController.updateMerchant);

module.exports = router;
