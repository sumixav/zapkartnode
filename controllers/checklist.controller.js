const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const checklistService       = require('../services/checklist.service');

const storeChecklist = async function(req, res){
    const param = req.body;
    let user = req.user;
    
    try {
        [err, storecheck] = await to(checklistService.storeChecklist(param, user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storecheck) {
            return ReS(res, {message:storecheck},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeChecklist = storeChecklist;

const getChecklist = async function(req, res) {
    try {
        let id  = req.params.id;
        [err, checklist] = await to(checklistService.getChecklistById(id, req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (checklist) {
                return ReS(res, { message:'checklist', checklistDetails : checklist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getChecklist = getChecklist;

const updateChecklist = async function(req, res) {
    let id  = req.params.id;

    try {
        [err, checklist] = await to(checklistService.updateChecklistService(id,req));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (checklist) {
                
                return ReS(res, { message:'Checklist has been updated', checklistDetails : checklist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }

};

module.exports.updateChecklist = updateChecklist;

const getChecklistperiod = async function(req, res) {
    try {
        let user = req.user;
        [err, checklistperiod] = await to(checklistService.getchecklistperiod(user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (checklistperiod) {
                return ReS(res, { message:'checklistperiod', checklistperiodDetails : checklistperiod}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getChecklistperiod = getChecklistperiod;

const getChecklistdetails = async function(req, res) {
    try {
        
        [err, checklist] = await to(checklistService.getchecklistDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (checklist) {
                return ReS(res, { message:'checklist', checklist : checklist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getChecklistdetails = getChecklistdetails;

const updateChecklistAnswer = async function(req, res) {

    let param = req.body;
    try {
        
        [err, checklistAns] = await to(checklistService.getchecklistAnswerDetails(req.user, param));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (checklistAns) {
                return ReS(res, { message:'checklistAns', checklistAnswer : checklistAns}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.updateChecklistAnswer = updateChecklistAnswer;