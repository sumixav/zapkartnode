const express = require('express');
const router = express.Router();

const custom = require('./../middleware/custom');
const Validate = require('../services/validate');
const CategoryController = require('../controllers/category.controller')
const AttributeGroupController = require('../controllers/attributeGroup.controller')


const passport = require('passport');
const path = require('path');

require('./../middleware/passport')(passport)

const { upload } = require('../middleware/upload')
const multerUpload = require('multer')()
const categoryUpload = upload('category').fields([{ name: 'image' }])
/* GET Heart Beat. */
router.get('/get-heart-beat', function (req, res, next) {
  res.json({ status: "success", message: "Zapkart API", data: { "version_number": "v1.0.0" } })
});

// router.get('/config', CommonController.config);
// Category
router.post('/category/create', categoryUpload, CategoryController.createCategory);
router.get('/category', CategoryController.getAllCategories);
router.get('/category/:id', CategoryController.getCategory);

// Attribute
router.get('/attributeGroup', AttributeGroupController.getAllAttrubutes);
router.post('/attributeGroup/create', multerUpload.none(), AttributeGroupController.createAttributeGroup);
router.get('/attributeGroup/:id', AttributeGroupController.getAttribute);


// router.post('/users/login', Validate.validateAuth, UserController.login);
// router.get('/users/:id', passport.authenticate('jwt', { session: false }), UserController.getUserById);
// //********* API DOCUMENTATION **********
// router.use('/docs/api.json', express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
// router.use('/docs', express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
