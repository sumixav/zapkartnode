const express 			              = require('express');
const router 			                = express.Router();

const custom 	                    = require('./../middleware/custom');
const Validate                    = require('../services/validate');
const UserController 	    = require('../controllers/user.controller');
const CommonController 	    = require('../controllers/common.controller');
const ChecklistController = require('../controllers/checklist.controller');
const BudgetController = require('../controllers/budget.controller');
const StyleController = require('../controllers/style.controller');
const GuestController = require('../controllers/guest.controller');
const WeddingController = require('../controllers/wedding.controller');
const VendorController = require('../controllers/vendor.controller');
const TipController = require('../controllers/tip.controller');
const DashboardController = require('../controllers/dashboard.controller');


const passport      	            = require('passport');
const path                        = require('path');

require('./../middleware/passport')(passport)

/* GET Heart Beat. */
router.get(   '/get-heart-beat', function(req, res, next) {
  res.json({status:"success", message:"WeddingApp API", data:{"version_number":"v1.0.0"}})
});

router.get(  '/config'     , CommonController.config);
router.post(  '/users/register'     , Validate.registerUser, UserController.create); 
router.post(  '/users/login'        , Validate.validateAuth, UserController.login);
router.get(   '/users/:id'          , passport.authenticate('jwt', {session:false}), UserController.getUserById);
router.put(   '/users/:id'          , passport.authenticate('jwt', {session:false}),  UserController.update);
router.post(  '/checklist/create'    , passport.authenticate('jwt', {session:false}),  Validate.validateChecklist, ChecklistController.storeChecklist);
router.get(   '/checklist/:id'        ,passport.authenticate('jwt', {session:false}),  ChecklistController.getChecklist);
router.post(  '/updatechecklist/:id'  ,passport.authenticate('jwt', {session:false}),  ChecklistController.updateChecklist); 
router.get(  '/checklistperiod'     , passport.authenticate('jwt', {session:false}),  ChecklistController.getChecklistperiod);
router.get(   '/checklistdetails/'        ,passport.authenticate('jwt', {session:false}),  ChecklistController.getChecklistdetails);
router.post(  '/checklist/updateanswer'    , passport.authenticate('jwt', {session:false}), ChecklistController.updateChecklistAnswer);

router.post(  '/budget/create'    , passport.authenticate('jwt', {session:false}), BudgetController.storeBudget);
router.get(   '/budget/:id'        ,passport.authenticate('jwt', {session:false}),  BudgetController.getBudget);
router.post(  '/updatebudget/:id'  ,passport.authenticate('jwt', {session:false}),  BudgetController.updateBudget); 
router.get(   '/budgetdetails/'        ,passport.authenticate('jwt', {session:false}),  BudgetController.getBudgetDetail);

router.post(  '/budgetmini/create'    , passport.authenticate('jwt', {session:false}), BudgetController.storeBudgetMini);
router.post(  '/updatebudgetmini/:id'  ,passport.authenticate('jwt', {session:false}),  BudgetController.updateBudgetMini);

router.get(  '/stylequiz'    , passport.authenticate('jwt', {session:false}), StyleController.getStyleQuiz);
router.post(  '/storestylequiz'    , passport.authenticate('jwt', {session:false}), StyleController.storeStyleQuiz);
router.post(  '/getstyleanswer'    , passport.authenticate('jwt', {session:false}), StyleController.getStyleAnswer);
router.post(  '/getstyleanswerDelete'    , passport.authenticate('jwt', {session:false}), StyleController.setStyleAnswerDelete);

router.get(  '/guestlist'    , passport.authenticate('jwt', {session:false}), GuestController.getGuestlist);
router.post(  '/storeguestlist'    , passport.authenticate('jwt', {session:false}), GuestController.storeGuestlist);
router.post(  '/storebulkguestlist'    , passport.authenticate('jwt', {session:false}), GuestController.storeBulkGuestlist);
router.post(  '/deleteguestlist'    , passport.authenticate('jwt', {session:false}), GuestController.deleteGuestlist);

router.post(  '/wedding/create'    , passport.authenticate('jwt', {session:false}), WeddingController.storeWedding);
router.get(   '/wedding/:id'        ,passport.authenticate('jwt', {session:false}),  WeddingController.getWedding);
router.post(  '/updatewedding/:id'  ,passport.authenticate('jwt', {session:false}),  WeddingController.updateWedding); 
router.get(   '/weddingdetails/'        ,passport.authenticate('jwt', {session:false}),  WeddingController.getWeddingDetail);

router.get(   '/vendordetails/'        ,passport.authenticate('jwt', {session:false}),  VendorController.getVendorDetail);
router.get(   '/tipdetails/'        ,passport.authenticate('jwt', {session:false}),  TipController.getTipDetail);

router.get(   '/dashboard/'        ,passport.authenticate('jwt', {session:false}),  DashboardController.getDashboardDetail);
//********* API DOCUMENTATION **********
router.use(   '/docs/api.json'       , express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use(   '/docs'                , express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
