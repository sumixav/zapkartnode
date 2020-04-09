const cleanDeep = require("clean-deep");
const {payment_method} = require("../auth_models");
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


exports.getPayment = async query => {
  [err, paymentlist] = await to(payment_method.findAll({where:{'status':'active'}}));
  if(err) { return err; }
  return paymentlist;
};

exports.getPaymentId = async (id) => {
  [err, paymentlist] = await to(payment_method.findAll({where:{'id':id}}));
  if(err) { return err; }
  return paymentlist;
};
