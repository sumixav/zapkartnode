const express = require("express");
const router = express.Router();

const custom = require("./../middleware/custom");
const Validate = require("../services/validate");
const CategoryController = require("../controllers/category.controller");
const AttributeGroupController = require("../controllers/attributeGroup.controller");
const ProductController = require("../controllers/product.controller");
const BrandConroller = require("../controllers/brand.controller");
const InformationController = require("../controllers/information.controller");
const TaxClassController = require("../controllers/taxclass.controller");
const CompositionController = require("../controllers/composition.controller");
const OrganicController = require("../controllers/organic.controller");
const MedicineTypeController = require("../controllers/medicineType.controller.js");
const ComboController = require("../controllers/combo.controller.js");

const passport = require("passport");
const path = require("path");

require("./../middleware/passport")(passport);

const { upload } = require("../middleware/upload");
const formUpload = require("multer")();
const categoryUpload = upload("category").fields([{ name: "image" }]);
const productUpload = upload("product").fields([
  { name: "image" },
  { name: "mainImage" }
]);
const brandUpload = upload("brand").fields([{ name: "image" }]);
const comboUpload = upload("combo").fields([{ name: "image" }]);

/* GET Heart Beat. */
router.get("/get-heart-beat", function(req, res, next) {
  res.json({
    status: "success",
    message: "Zapkart API",
    data: { version_number: "v1.0.0" }
  });
});

//auth details
//router.post(  '/users/register'     , Validate.registerUser, UserController.create);
//router.post(  '/users/login'        , Validate.validateAuth, UserController.login);
// router.get('/config', CommonController.config);
// Category
router.post(
  "/category/create",
  categoryUpload,
  Validate.validateCategory,
  CategoryController.createCategory
);
router.get("/category", CategoryController.getAllCategories);
router.get("/category/:id", CategoryController.getCategory);
router.patch(
  "/category/:id",
  categoryUpload,
  Validate.validateEditCategory,
  CategoryController.editCategory
);
router.delete("/category/:id", CategoryController.deleteCategory);

// Attribute
router.get("/attributeGroup", AttributeGroupController.getAllAttrubutes);
router.post(
  "/attributeGroup/create",
  formUpload.none(),
  AttributeGroupController.createAttributeGroup
);
router.get("/attributeGroup/:id", AttributeGroupController.getAttribute);
router.patch(
  "/attributeGroup/:id",
  AttributeGroupController.editAttributeGroup
);
router.delete(
  "/attributeGroup/:id",
  AttributeGroupController.deleteAttributeGroup
);
router.patch("/attributeGroup/restore/:id", AttributeGroupController.restore);

// Product
router.post(
  "/products/create",
  productUpload,
  Validate.validateProduct,
  ProductController.createProduct
);
router.get("/products/:productId", ProductController.getProduct);
router.get("/products", ProductController.getAllProducts);
router.get("/products/variants/:productId", ProductController.getAllVariants);
router.patch(
  "/products/:productId",
  productUpload,
  ProductController.editProduct
);
router.delete("/products/:productId", ProductController.deleteProduct);
// router.patch('/products/restore:productId', ProductController.restore);

// Brand
router.post(
  "/brands/create",
  brandUpload,
  Validate.validateBrand,
  BrandConroller.createBrand
);
router.get("/brands/", BrandConroller.getAllBrands);
router.get("/brands/:brandId", BrandConroller.getBrand);
router.patch("/brands/:brandId", brandUpload, BrandConroller.editBrand);
router.delete("/brands/:id", BrandConroller.deleteBrand);

// Tax Class
router.post("/taxClass/create", TaxClassController.createTaxClass);
router.get("/taxClass/", TaxClassController.getAllTaxClasss);
router.get("/taxClass/:taxClassId", TaxClassController.getTaxClass);
router.patch("/taxClass/:taxClassId", TaxClassController.editTaxClass);
router.delete("/taxClass/:taxClassId", TaxClassController.deleteTaxClass);
router.patch(
  "/taxClass/restore/:taxClassId",
  TaxClassController.restoreTaxClass
);
// router.patch('/brands/:brandId', brandUpload, (Validate.validateBrand("update")), BrandConroller.editBrand);

// Composition
router.post("/composition/create",  CompositionController.createComposition);
router.get("/composition/", CompositionController.getAllCompositions);
router.get("/composition/:compositionId", CompositionController.getComposition);
router.patch(
  "/composition/:compositionId",
  CompositionController.editComposition
);
router.delete(
  "/composition/:compositionId",
  CompositionController.deleteComposition
);
router.patch(
  "/composition/restore/:compositionId",
  CompositionController.restoreComposition
);
// Organic
router.post("/organic/create", OrganicController.createOrganic);
router.get("/organic/", OrganicController.getAllOrganics);
router.get("/organic/:organicId", OrganicController.getOrganic);
router.patch("/organic/:organicId", OrganicController.editOrganic);
router.delete("/organic/:organicId", OrganicController.deleteOrganic);
router.patch("/organic/restore/:organicId", OrganicController.restoreOrganic);

// Medicine Type
router.post("/medicineType/create", MedicineTypeController.createMedicineType);
router.post(
  "/medicineType/createBulk",
  Validate.validateMedicineTypesBulk,
  MedicineTypeController.createMedicineTypeBulk
);
router.get("/medicineType/", MedicineTypeController.getAllMedicineTypes);
router.get(
  "/medicineType/:medicineTypeId",
  MedicineTypeController.getMedicineType
);
router.patch(
  "/medicineType/:medicineTypeId",
  MedicineTypeController.editMedicineType
);
router.delete(
  "/medicineType/:medicineTypeId",
  MedicineTypeController.deleteMedicineType
);
router.patch(
  "/medicineType/restore/:medicineTypeId",
  MedicineTypeController.restoreMedicineType
);

// Combo
router.post(
  "/combo/create",
  comboUpload,
  Validate.validateCombo,
  ComboController.createCombo
);
router.get("/combos/", ComboController.getAllCombos);
router.get("/combos/:comboId", ComboController.getCombo);
router.patch("/combos/:comboId", brandUpload, ComboController.editCombo);
router.delete("/combos/:id", ComboController.deleteCombo);

// Information
router.post(
  "/informations/create",
  formUpload.none(),
  Validate.validateInfos,
  InformationController.createInformation
);
router.get("/informations/", InformationController.getAllInformations);
router.get("/informations/:informationId", InformationController.getInformation);
// router.patch("/informations/:informationId", formUpload.none(), Validate.validateInfos, InformationController.editInformation);
router.patch("/informations/:informationId", formUpload.none(), InformationController.editInformation);
router.delete("/informations/:informationId", InformationController.deleteInformation);

// router.post('/users/login', Validate.validateAuth, UserController.login);
// router.get('/users/:id', passport.authenticate('jwt', { session: false }), UserController.getUserById);
// //********* API DOCUMENTATION **********
// router.use('/docs/api.json', express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
// router.use('/docs', express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
