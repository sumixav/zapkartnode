const { to, ReE, ReS, TE } = require("../services/util.service");
const { status_codes_msg } = require("../utils/appStatics");
const Logger = require("../logger");

const dataService = require("../services/data.service");

exports.uploadExcel = async function(req, res) {
  try {
    const param = req.file;
    if (typeof req.file === "undefined") TE("File required");
    const [err, uploaded] = await to(dataService.uploadExcel(param));
    if (err) throw err;
    // return res.send(uploaded)
      return ReS(
        res,
        { message: "Data added", data:uploaded },
        status_codes_msg.SUCCESS.code
      );
  } catch (err) {
    return ReE(res, err, status_codes_msg.INVALID_ENTITY.code);
  }
};


