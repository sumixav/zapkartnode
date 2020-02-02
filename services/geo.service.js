const cleanDeep = require("clean-deep");
const {countries, states, cities} = require("../auth_models");
const validator = require("validator");
const {
  to,
  TE,
  ReE,
  ReS,
  isEmpty
} = require("../services/util.service");
const Logger = require("../logger");
//use parse-strings-in-object



exports.getCountry = async (param) => {
  [err, countrylists] = await to(countries.findAll());
  if(err) { return err; }
  return countrylists;
};

const getStateId = async (id) => {
    [err, statelist] = await to(states.findAll({where:{countryId:id}}));
    if(err) { return err; }
    return statelist;
  }
  
  module.exports.getStateId = getStateId;

  const getCityId = async (id) => {
    [err, citylist] = await to(cities.findAll({where:{stateId:id}}));
    if(err) { return err; }
    return citylist;
  }
  
  module.exports.getCityId = getCityId;