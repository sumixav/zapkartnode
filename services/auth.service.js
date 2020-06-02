const { users, user_types, address } = require("../auth_models");
const validator = require("validator");
const { to, TE, omitUserProtectedFields } = require("../services/util.service");
const { sendMail } = require("../services/mail.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Logger = require("../logger");
const cryptoRandomString = require("crypto-random-string")
const parseStrings = require("parse-strings-in-object");



const RESET_TOKEN_EXPIRES_IN = 30; //30 minutes

const findUserByEmail = async function (email) {
  if (email && validator.isEmail(email)) {
    [err, user] = await to(users.findOne({ where: { email: email } }));
    if (err) {
      return err;
    }
    if (user && user.email) {
      return { email: user.email };
    } else {
      return { message: "NotExist" };
    }
  }
};
module.exports.findUserByEmail = findUserByEmail;

const findUserByPhone = async function (phone) {
  if (phone && validator.isMobilePhone(phone)) {
    [err, user] = await to(users.find({ where: { phone: phone } }));
    if (err) {
      return err;
    }
    if (user && user.phone) {
      return { phone: user.phone };
    } else {
      return { message: "NotExist" };
    }
  }
};
module.exports.findUserByPhone = findUserByPhone;

const createUser = async userInfo => {
  let email = await findUserByEmail(userInfo.email);

  let phone =
    typeof userInfo.phone != "undefined"
      ? await findUserByPhone(userInfo.phone.toString())
      : null;

  let imagesPath = [];
  let userParam = {};

  if (typeof userInfo.files != "undefined") {
    images = userInfo.files["image"];
    imagesPath = images.map(i => i.path);
    userParam.avatarlocation = imagesPath;
  }
  if (email.message === "NotExist") {
    userParam.firstName = userInfo.firstName;
    userParam.lastName = userInfo.lastName;
    userParam.email = userInfo.email;
    userParam.phone =
      typeof userInfo.phone != "undefined" ? userInfo.phone : null;
    userParam.password = userInfo.password;
    userParam.userTypeId = userInfo.roleId;
    userParam.active = 1;
    userParam.phoneVerified = 0;
    userParam.confirmed = 1;
    [err, user] = await to(users.create(userParam));
    if (err) {
      return TE(err.message);
    }
    Logger.info("dsfdg", user);
    return user;
  } else if (email && email.email) {
    return TE("Email ID with same name already exists. Please choose a different email ID");
  } else if (phone && phone.phone) {
    return TE("phone number already exist");
  }
};
module.exports.createUser = createUser;

const authUser = async function (userInfo) {
  //console.log("999999999999999",userInfo.loginId);
  if (validator.isEmail(userInfo.loginId)) {
    [err, user] = await to(
      users.findOne({
        where: [{ email: userInfo.loginId }],
        include: [{ model: user_types, required: false }]
      })
    );
    if (err) TE(err.message);
  } else if (validator.isMobilePhone(userInfo.loginId)) {
    [err, user] = await to(
      users.findOne({
        where: [{ phone: userInfo.loginId }],
        include: [{ model: user_types, required: false }]
      })
    );
    if (err) TE(err.message);
  }

  if (!user) TE("User not registered");
  if (user.active === 0) {
    TE("Insufficient privileges to login to this account");
  }

  [err, user] = await to(user.comparePassword(userInfo.password));
  if (err) TE(err.message);
  return user;
};
module.exports.authUser = authUser;

const updateUser = async function (userData, userId) {
  let err, user;
  // userData = userBodyParam(param.body);
  userData = parseStrings(userData);
  Logger.info(userData, userId);
  [err, user] = await to(users.update(userData, { where: { id: userId, userTypeId: 2 } }));
  if (err) TE(err.message);
  if (!user || (user && user[0] === 0)) TE("Unable to update")
  Logger.info(user);
  return user;
};
module.exports.updateUser = updateUser;

const userBodyParam = params => {
  let user = {};
  for (var data in params) {
    user[data] = params[data];
  }
  return user;
};

module.exports.userBodyParam = userBodyParam;

const getUser = async function (userId) {
  console.log(userId);
  [err, user] = await to(
    users.findOne({
      where: [{ id: userId }],
      include: [{ model: user_types, required: false }]
    })
  );
  if (err) TE(err.message);
  return user;
};
module.exports.getUser = getUser;

const authuserSearch = async function (param) {
  [err, user] = await authSearchCriteria(param);
  if (err) TE(err.message);
  return user;
};
module.exports.authuserSearch = authuserSearch;

const authSearchCriteria = async function (params) {
  let search = {};
  switch (params.usertype) {
    case 1:
      [err, user] = await to(
        users.find({ where: { email: { [Op.like]: `%${params.values}%` } } })
      );
      if (err) {
        return err;
      }
      break;

    case 2:
      [err, user] = await to(
        users.find({ where: { phone: { [Op.like]: `%${params.values}%` } } })
      );
      if (err) {
        return err;
      }
      break;

    case 3:
      [err, user] = await to(
        users.find({
          where: { firstName: { [Op.like]: `%${params.values}%` } }
        })
      );
      if (err) {
        return err;
      }
      break;
  }

  return user;
};

module.exports.authSearchCriteria = authSearchCriteria;

const authFbUser = async function (userInfo) {
  [err, user] = await to(
    users.findOne({
      where:
      {
        email: userInfo.loginId,

        // socialMediaId: userInfo.id,
        // socialType: "facebook"
      },
      include: [{ model: user_types, required: false }]


    })
  );
  if (err) TE(err.message);
  let userParam = {};
  userParam.firstName = userInfo.name;
  userParam.lastName = "";
  userParam.email = userInfo.loginId;
  userParam.socialMediaId = userInfo.id;
  userParam.socialType = "facebook";
  userParam.userTypeId = +userInfo.roleId;
  userParam.active = 1;
  userParam.confirmed = 1;
  if (!user) {
    Logger.info(userParam);
    [err, user] = await to(users.create(userParam));
    if (err) {
      return TE(err.message);
    }
  }
  if (user && user.socialType !== "facebook" && user.socialType !== userInfo.id) {
    [err, user] = await to(users.update(userParam, { where: { email: userParam.email } }));
    if (err) {
      return TE(err.message);
    }
    if (!user || user[0] === 0) TE("Unable to update user")
  }
  user = await users.findOne({
    where: { email: userInfo.loginId },
    include: [{ model: user_types, required: false }]
  })
  return user;
};
module.exports.authFbUser = authFbUser;

const authGbUser = async function (userInfo) {
  [err, user] = await to(
    users.findOne({
      where: [
        {
          email: userInfo.loginId,
          // socialMediaId: userInfo.id,
          // socialType: "google"
        }
      ]
    })
  );
  if (err) TE(err.message);
  let userParam = {};
  userParam.firstName = userInfo.name;
  userParam.lastName = "";
  userParam.email = userInfo.loginId;
  userParam.socialMediaId = userInfo.id;
  userParam.socialType = "google";
  userParam.userTypeId = +userInfo.roleId;
  userParam.active = 1;
  userParam.confirmed = 1;
  if (user && user.socialType !== "google" && user.socialType !== userInfo.id) {
    Logger.info(userParam);
    [err, user] = await to(users.update(userParam, { where: { email: userInfo.loginId } }));
    if (err) {
      return TE(err.message);
    }
    if (!user || user[0] === 0) TE("Unable to update user")

  }
  if (!user) {
    Logger.info(userParam);
    [err, user] = await to(users.create(userParam));
    if (err) {
      return TE(err.message);
    }
  }
  user = await users.findOne({ where: { email: userInfo.loginId }, include: [{ model: user_types, required: false }] })
  return user;

};
module.exports.authGbUser = authGbUser;


module.exports.forgotPassword = async function (email) {
  const [err, user] = await to(
    users.findOne({
      where: {
        email: {
          [Op.eq]: email
        }
      }
    })
  );
  if (err) TE(err.message);
  if (!user) TE("User not found in database");
  const resetPasswordToken = cryptoRandomString({ length: 10, type: 'url-safe' });

  user.update({
    resetPasswordToken,
    resetPasswordExpiresIn: Date.now() + (RESET_TOKEN_EXPIRES_IN * 60000) // 6 minutes
  })

  const [errMail, mailStatus] = await to(sendMail({
    to: email,
    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
      + `Please click on the following link, or paste this into your browser to complete the process within ${RESET_TOKEN_EXPIRES_IN} minutes of receiving it:\n\n`
      + `http://localhost:3000/reset-password/${resetPasswordToken}\n\n`
      + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
    subject: 'Reset password'
  }));

  Logger.info(mailStatus)

  if (errMail || !mailStatus || !mailStatus.messageId) TE("Error sending mail")
  if (mailStatus.messageId) {
    return 'Password recovery mail sent'
  }
};


module.exports.validateResetPasswordToken = async (params) => {
  const { email, resetPasswordToken } = params;
  const [err, user] = await to(users.find({
    where: {
      email,
      resetPasswordToken,
      resetPasswordExpiresIn: {
        [Op.gt]: Date.now()
      },
    }
  }));
  if (err) TE("Error finding user")
  if (!user) TE("Invalid password recovery token or token has expired");
  return user
}

module.exports.updatePassword = async (params, user) => {
  const { password, resetPasswordToken } = params
  let updateQuery = { password, passwordChangedAt: Date.now() }
  if (resetPasswordToken) updateQuery = {
    ...updateQuery,
    resetPasswordExpiresIn: null,
    resetPasswordToken: null,
    passwordChangedAt: Date.now()
  };



  const [err, updatedUser] = await to(user.update(
    updateQuery
  ));

  if (!updatedUser || err) TE("Error updating password");


  Logger.info(updatedUser)

  return updatedUser;

}


exports.verifyPassword = async (params, user) => {
  let [err, u] = await to(user.verifyPassword(params.currentPassword));
  if (err) TE(err.message);
  Logger.info(u, !u)
  if (!u) TE("No user");
  u = u.toWeb();
  return omitUserProtectedFields(u);
}


const getUserperPage = async (param) => {

  let { pagelimit, offset } = parseStrings(param)

  const [err, user] = await to(users.findAndCountAll({
    where: { active: 1 },
    limit: pagelimit, offset: offset
  }));
  if (err) { return TE(err.message); }
  return user;
}
module.exports.getUserperPage = getUserperPage;


