const {
  users,
  otp: Otp,
  sequelize
} = require("../auth_models");
const fetch = require("node-fetch");
const Sequelize = require("sequelize");
const Logger = require("../logger");
const Op = Sequelize.Op;
const { smsApi } = require("../config/config");
const { TE, to, generateRandom } = require("./util.service");
const differenceInMins = require("date-fns/differenceInMinutes")
const addMinutes = require("date-fns/addMinutes");
const { STRINGS } = require("../utils/appStatics");

const EXPIRES_MINUTES = 5;
const MAX_NO_OF_TRIES = 5;
const RETRY_MINUTES = 2;

const getSmsUrl = ({ senderNo, otp }) => {
  const message = 'Your OTP for phone verification is ' + otp + '. Expires in ' + EXPIRES_MINUTES + ' minutes.';
  const url = `http://msg.mtalkz.com/V2/http-api.php?apikey=${smsApi.apiKey}&senderid=${smsApi.senderId}&number=${senderNo}&message=${message}&format=json`
  return url
}

module.exports.generateOtp = async ({ phone, userId }) => {
  let err, res, resJson, duplicatePhone, otpDoc, updatedOtp;

  // duplicate number
  [err, duplicatePhone] = await to(users.findOne({ where: { phone: phone } }));
  // [err, duplicatePhone] = await to(users.findOne({ where: { phone, id: { [Op.not]: userId } } }));
  if (err) {
    TE("Database Error");
    Logger.error(err.message);
  }
  console.log('dip', duplicatePhone)
  if (duplicatePhone) {
    if (duplicatePhone.userId !== userId) TE("Phone number already exists with another account.");
  }

  // delete past requests
  [err, deleted] = await to(Otp.destroy({ where: { userId, phone: { [Op.not]: phone } } }));
  if (err) TE(err.message);
  console.log('mmm', deleted)

  const otp = generateRandom();
  const currentdt = new Date()
  const expiresAt = new Date(Date.now() + (EXPIRES_MINUTES * 60 * 1000));

  // if otp requested again
  [err, existingOtp] = await to(Otp.findOne({ where: { userId } }));
  // [err, existingOtp] = await to(Otp.findOne({ where:{userId, phone} }));
  if (err) {
    TE("Database Error. " + err.message);
    Logger.error(err.message);
  }

  Logger.info('existingOtp', existingOtp)

  if (existingOtp) {
    let noOfRetries = existingOtp.noOfRetries + 1;
    if (noOfRetries >= MAX_NO_OF_TRIES) {
      let retrydt = addMinutes(existingOtp.lastRetry, RETRY_MINUTES)
      const diff = RETRY_MINUTES - differenceInMins(currentdt, existingOtp.lastRetry);
      // if (minutesDiff < RETRY_MINUTES) TE(`You have exceeded the maximum amount of requests. Please try again in ${RETRY_MINUTES - minutesDiff} minutes.`);
      if (existingOtp.lastRetry && (currentdt < retrydt)) TE(`You have exceeded the maximum amount of requests. Please try again in ${diff} minute(s).`);
      else noOfRetries = 0;
    }
    // [err, updatedOtp] = await to(Otp.update({ otp, expiresAt, noOfRetries, lastRetry: currentdt }, { where: { userId, phone } }));
    [err, updatedOtp] = await to(Otp.update({ otp, expiresAt, noOfRetries, lastRetry: currentdt, phone }, { where: { userId } }));
    if (err) TE(err.message);
    Logger.info('NNN', updatedOtp)
    if (!updatedOtp || updatedOtp[0] !== 1) TE("Error updating OTP");
  }
  else {
    [err, otpDoc] = await to(Otp.create({
      otp,
      userId,
      phone,
      expiresAt,
      noOfRetries: 0
    }));
    if (err) TE(err.message);
    if (!otpDoc) TE("Database Error");
    Logger.info('otpDoc', otpDoc);
  }
  // const smsUrl = getSmsUrl({ senderNo: phone, otp });
  // [err, res] = await to(fetch(smsUrl));
  // if (err) TE("Error sending SMS. " + err.message);
  // [err, resJson] = await to(res.json());
  // if (err) TE("Error sending SMS. " + err.message);
  // if (resJson && resJson.status === "OK") 
  return true
  // return { otp };
  // TE("Error sending SMS. Please try again later");
};

module.exports.verifyOtp = async ({ phone, userId, otp }) => {
  let err, otpDoc, deletedCountA, deletedCountB;
  const currentdt = new Date();
  [err, otpDoc] = await to(Otp.findOne({
    where: {
      phone, userId, otp, expiresAt: { [Op.gt]: currentdt }
    }
  }));
  if (err) TE(`${STRINGS.DB_ERROR} ${err.message}`)
  if (!otpDoc) TE("OTP invalid or has expired");

  const [errA, isUpdated] = await to(sequelize.transaction(async (t) => {
    [err, deletedCountB] = await to(Otp.destroy({ where: { phone, userId }, transaction: t }));
    if (err) TE(`${STRINGS.DB_ERROR} ${err.message}`);
    if (!deletedCountB || deletedCountB !== 1) TE(STRINGS.DB_ERROR);
    [err, updatedUser] = await to(users.update({ phoneVerified: 1, phone }, { where: { id: userId }, transaction: t }));
    if (err) TE(`${STRINGS.DB_ERROR} ${err.message}`);
    if (!updatedUser || updatedUser[0] === 0) TE(STRINGS.DB_ERROR);
    return true
  }));

  if (errA) TE(errA.message);
  if (!isUpdated) TE(STRINGS.DB_ERROR);
  return true;
}
