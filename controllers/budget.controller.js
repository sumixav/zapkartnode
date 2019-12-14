const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const budgetService       = require('../services/budget.service');

const storeBudget = async function(req, res){
    const param = req.body;
    let user = req.user;
    
    try {
        [err, storebud] = await to(budgetService.storeBudgetlist(param, user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storebud) {
            return ReS(res, {message:storebud},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeBudget = storeBudget;

const getBudget = async function(req, res) {
    try {
        let id  = req.params.id;
        [err, budgetlist] = await to(budgetService.getBudgetById(id, req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (budgetlist) {
                return ReS(res, { message:'budget', budgetDetails : budgetlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getBudget = getBudget;

const updateBudget = async function(req, res) {
    let id  = req.params.id;

    try {
        [err, budgetlist] = await to(budgetService.updateBudgetService(id,req));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (budgetlist) {
                
                return ReS(res, { message:'budget has been updated', budgetlistDetails : budgetlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }

};

module.exports.updateBudget = updateBudget;

const getBudgetDetail = async function(req, res) {
    try {
        
        [err, budgetlist] = await to(budgetService.getBudgetDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (budgetlist) {
                return ReS(res, { message:'budgetlist', budgetlist : budgetlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getBudgetDetail = getBudgetDetail;

const storeBudgetMini = async function(req, res){
    const param = req.body;
   
    
    try {
        [err, storebudmini] = await to(budgetService.storeBudgetMinilist(param));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storebudmini) {
            return ReS(res, {message:storebudmini},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeBudgetMini = storeBudgetMini;

const updateBudgetMini = async function(req, res) {
    let id  = req.params.id;
console.log(id);
    let param = req.body;
    try {
        [err, budgetlistmini] = await to(budgetService.updateBudgetMiniService(id, param));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (budgetlistmini) {
                
                return ReS(res, { message:'budget has been updated', budgetlistminiDetails : budgetlistmini}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }

};

module.exports.updateBudgetMini = updateBudgetMini;
