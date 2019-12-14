const { languages, user_types}   = require('../models');
const { to, TE , ReE}    = require('../services/util.service');

const configTypes = async function(){
    let configDetails = languagelist = partnerType = {};
    [err, languagelist] = await to(languages.findAll());
      if(err) TE(err.message);
      configDetails.language = languagelist;
      [err, partnerType] = await to(user_types.findAll());
      if(err) TE(err.message);
      configDetails.partner = partnerType;
      configDetails.termcondition = "Terms and Condtions";
      configDetails.aboutus = "About Us";
      return configDetails;
}

module.exports.configTypes = configTypes;





