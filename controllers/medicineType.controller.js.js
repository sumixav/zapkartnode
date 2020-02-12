/* eslint-disable camelcase */
const { to, ReE, ReS } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");

const medicineTypeService = require("../services/medicineType.service");

exports.createMedicineType = async (req, res, next) => {
  const param = req.body;
  try {
    const [err, medicineType] = await to(
      medicineTypeService.createMedicineType(param)
    );
    Logger.info(err);
    if (err) {
      throw err;
    }
    if (medicineType) {
      return ReS(
        res,
        { message: "Medicine Type", data: medicineType },
        status_codes_msg.CREATED.code
      );
    }
  } catch (err) {
    return next(err);
  }
};

exports.getAllMedicineTypes = async (req, res, next) => {
  try {
    const [err, medicineTypes] = await to(
      medicineTypeService.getAllMedicineTypees(req.query)
    );
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (medicineTypes) {
      return ReS(
        res,
        {
          message: "Medicine Type",
          data: medicineTypes,
          count: medicineTypes.length
        },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.getMedicineType = async (req, res, next) => {
  try {
    const [err, medicineType] = await to(
      medicineTypeService.getMedicineType(req.params.medicineTypeId)
    );
    if (err) {
      return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
    }
    if (medicineType) {
      return ReS(
        res,
        { message: "Medicine Type", data: medicineType },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.editMedicineType = async (req, res, next) => {
  const param = req.body;
  const medicineTypeId = req.params.medicineTypeId;
  try {
    const [err, medicineType] = await to(
      medicineTypeService.editMedicineType(param, medicineTypeId)
    );
    if (err) {
      console.log("will throw error");
      throw err;
    }
    if (medicineType) {
      return ReS(
        res,
        { message: "Medicine Type", data: medicineType },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (error) {
    console.log("caught", error);
    return next(error);
  }
};

exports.deleteMedicineType = async function (req, res, next) {
  try {
    const [err, isDeleted] = await to(
      medicineTypeService.deleteMedicineType(req.params.medicineTypeId)
    );
    Logger.info(err, isDeleted);
    if (err) throw err;
    if (isDeleted) {
      return ReS(
        res,
        { message: STRINGS.DELETED },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return next(err);
  }
};

exports.restoreMedicineType = async function (req, res, next) {
  try {
    const [err, data] = await to(
      medicineTypeService.restoreMedicineType(req.params.medicineTypeId)
    );
    Logger.info(err, data);
    if (err) throw err;
    if (data) {
      return ReS(
        res,
        { message: STRINGS.RESTORED, data },
        status_codes_msg.SUCCESS.code
      );
    }
  } catch (err) {
    return next(err);
  }
};

exports.createMedicineTypeBulk = async function (req, res, next) {
  try {
    Logger.info(req.body)
    const [err, data] = await to(medicineTypeService.createMedicineTypes(req.body.data));
    if (err) throw err;
    if (data) {
      return ReS(
        res,
        { message: STRINGS.CREATE_SUCCESS, data },
        status_codes_msg.CREATED.code
      );
    }
  } catch (error) {
    return next(error)
  }
}
