const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const styleService       = require('../services/style.service');


const getStyleQuiz = async function(req, res) {
    try {
        [err, stylelist] = await to(styleService.getStyleDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (stylelist) {
                return ReS(res, { message:'stylelist', styleDetails : stylelist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getStyleQuiz = getStyleQuiz;

const storeStyleQuiz = async function(req, res){
    const param = req.body;
    let user = req.user;
    
    try {
        [err, storestyle] = await to(styleService.storeStylelist(param, user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (storestyle) {
            return ReS(res, {message:storestyle},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.storeStyleQuiz = storeStyleQuiz;


const getStyleAnswer = async function(req, res) {
    try {
        [err, stylelistans] = await to(styleService.getStyleAnswerDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (stylelistans) {
                [err, stylelist] = await to(styleService.getStyleOptionDetails(stylelistans));
                if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
                //console.log("fffffffffffffffffff",stylelist[0]['opt1']);
                return ReS(res, { message:'stylelist', styleDetails : stylelist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getStyleAnswer = getStyleAnswer;


const setStyleAnswerDelete = async function(req, res){
    
    let user = req.user;
    
    try {
        [err, deletestyle] = await to(styleService.stylelistDelete(user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            console.log("gggggggg",JSON.stringify(deletestyle));
            if (deletestyle) {
            return ReS(res, {message:deletestyle},  status_codes_msg.SUCCESS.code);
            }
        } catch (err) {
            return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
        }   
};

module.exports.setStyleAnswerDelete = setStyleAnswerDelete;