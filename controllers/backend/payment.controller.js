const { to, ReE, ReS } = require("../../services/util.service");
const { status_codes_msg } = require("../../utils/appStatics");
const Logger = require("../../logger");

const paymentService = require("../../services/payment.service");


exports.getPaymentMethod = async (req, res, next) => {
  try {
    const [err, payments] = await to(paymentService.getPayment());
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (payments) {
      return ReS(
        res,
        { message: "Payment", data: payments },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};