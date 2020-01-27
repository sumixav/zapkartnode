/* eslint-disable camelcase */
const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger');

const taxClassService = require('../services/taxClass.service');

exports.createTaxClass = async (req, res, next) => {
  const param = req.body;
  try {
    const [err, taxClass] = await to(taxClassService.createTaxClass(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (taxClass) {
      return ReS(
        res,
        { message: 'TaxClass', data: taxClass },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllTaxClasss = async (req, res, next) => {
  try {
    const [err, taxClasss] = await to(taxClassService.getAllTaxClasses(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (taxClasss) {
      return ReS(
        res,
        { message: 'TaxClass', data: taxClasss, count: taxClasss.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getTaxClass = async (req, res, next) => {
  try {
    const [err, taxClass] = await to(taxClassService.getTaxClass(req.params.taxClassId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (taxClass) {
      return ReS(
        res,
        { message: 'TaxClass', data: taxClass },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editTaxClass = async (req, res, next) => {
  const param = req.body;
  param.taxClassId = req.params.taxClassId;
  try {
    const [err, taxClass] = await to(
      taxClassService.editTaxClass(param, req.query)
    );
    if (err) {
      console.log('will throw error');
      throw err;
    }
    if (taxClass) {
      return ReS(
        res,
        { message: 'TaxClass', data: taxClass },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log('caught', error);
    return next(error);
  }
};

exports.deleteTaxClass = async function (req, res) {
  try {
    const [err, isDeleted] = await to(taxClassService.deleteTaxClass(req.params.taxClassId));
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted) {
      return ReS(
        res,
        { message: 'Tax class deleted' },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.restoreTaxClass = async function (req, res) {
  try {
    const [err, data] = await to(taxClassService.restoreTaxClass(req.params.taxClassId));
    Logger.info(err, data);
    if (err) throw err;
    if (data) {
      return ReS(
        res,
        { message: 'Tax class restored', data },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
