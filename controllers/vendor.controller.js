const { to, ReE, ReS }  = require('../services/util.service');
const { status_codes_msg }  = require('../utils/appStatics');
const vendorService       = require('../services/vendor.service');

const getVendorDetail = async function(req, res) {
    try {
        
        [err, vendorlist] = await to(vendorService.getVendorDetails(req.user));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (vendorlist) {
                return ReS(res, { message:'vendorlist', vendorlist : vendorlist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
};

module.exports.getVendorDetail = getVendorDetail;