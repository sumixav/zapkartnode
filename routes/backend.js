const express = require('express');
const router = express.Router();
const UserController 	    = require('../controllers/backend/user.controller');
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

module.exports = router;
