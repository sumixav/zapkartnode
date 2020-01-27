/* eslint-disable camelcase */
const { to, ReE, ReS } = require('../services/util.service');
const { status_codes_msg } = require('../utils/appStatics');
const Logger = require('../logger');

const compositionService = require('../services/composition.service');

exports.createComposition = async (req, res, next) => {
  const param = req.body;
  try {
    const [err, composition] = await to(compositionService.createComposition(param));
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (composition) {
      return ReS(
        res,
        { message: 'Composition', data: composition },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getAllCompositions = async (req, res, next) => {
  try {
    const [err, compositions] = await to(compositionService.getAllCompositiones(req.query));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (compositions) {
      return ReS(
        res,
        { message: 'Composition', data: compositions, count: compositions.length },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.getComposition = async (req, res, next) => {
  try {
    const [err, composition] = await to(compositionService.getComposition(req.params.compositionId));
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (composition) {
      return ReS(
        res,
        { message: 'Composition', data: composition },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.editComposition = async (req, res, next) => {
  const param = req.body;
  param.compositionId = req.params.compositionId;
  try {
    const [err, composition] = await to(
      compositionService.editComposition(param, req.query)
    );
    if (err) {
      console.log('will throw error');
      throw err;
    }
    if (composition) {
      return ReS(
        res,
        { message: 'Composition', data: composition },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log('caught', error);
    return next(error);
  }
};

exports.deleteComposition = async function (req, res) {
  try {
    const [err, isDeleted] = await to(compositionService.deleteComposition(req.params.compositionId));
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted) {
      return ReS(
        res,
        { message: 'composition deleted' },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};

exports.restoreComposition = async function (req, res) {
  try {
    const [err, data] = await to(compositionService.restoreComposition(req.params.compositionId));
    Logger.info(err, data);
    if (err) throw err;
    if (data) {
      return ReS(
        res,
        { message: 'composition restored', data },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};
