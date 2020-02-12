const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");

const geoService = require("../../services/geo.service");


const getAllCountry = async function(req, res) {
  try {
      [err, countrylist] = await to(geoService.getCountry());
          if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
          if (countrylist) {
              return ReS(res, { message:'country', data : countrylist}
                      , status_codes_msg.SUCCESS.code);
          }
  } catch (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

module.exports.getAllCountry = getAllCountry;

const getState = async function(req, res) {
    try {
        let id  = req.params.id;
        [err, statelist] = await to(geoService.getStateId(id));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (statelist) {
                return ReS(res, { message:'state', data : statelist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
  };
  
  module.exports.getState = getState;

  const getCity = async function(req, res) {
    try {
        let id  = req.params.id;
        [err, citylist] = await to(geoService.getCityId(id));
            if(err) return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
            if (citylist) {
                return ReS(res, { message:'city', data : citylist}
                        , status_codes_msg.SUCCESS.code);
            }
    } catch (err) {
        return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
  };
  
  module.exports.getCity = getCity;

