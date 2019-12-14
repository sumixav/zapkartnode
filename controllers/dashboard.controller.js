const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const dashboardService       = require('../services/dashboard.service');


const getDashboardDetail = async function(req, res) {
    try {
        [err, dashboardlist] = await to(dashboardService.getDashboard(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (dashboardlist) {
                return ReS(res, { message:'Dashboard', dashboardDetails : dashboardlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getDashboardDetail = getDashboardDetail;