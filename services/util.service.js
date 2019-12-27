const { to } = require('await-to-js');
const path = require('path');
const pe = require('parse-error');
const fs = require('fs').promises
const gm = require('gm')
const mongoose = require('mongoose')
const Logger = require('../logger')

module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if (err) return [pe(err)];

    return [null, res];
};

module.exports.ReE = function (res, err, code) { // Error Web Response
    if (typeof err == 'object' && typeof err.message != 'undefined') {
        err = err.message;
    }

    if (typeof code !== 'undefined') res.statusCode = code;
    Logger.error(JSON.stringify(err));
    return res.json({ success: false, error: err });
};

module.exports.ReS = function (res, data, code) { // Success Web Response
    let send_data = { success: true };

    if (typeof data == 'object') {
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};

module.exports.TE = TE = function (err_message, log) { // TE stands for Throw Error
    if (log === true) {
        console.error(err_message);
    }
    throw new Error(err_message);
};

exports.deleteFile = async path => {
    return fs.unlink(`./${path}`)
        .then(a => {
            Logger.info("deleted ", path, a);
            return true;
        })

        .catch(err => {
            Logger.error(err);
            throw err;
        });
}

exports.saveThumbnails = imagePathArray => {
    Logger.info(imagePathArray)
    const promises = imagePathArray.map(imagePath => {
        Logger.info(imagePath);
        const parsedPath = path.parse(imagePath);
        const thumbName = `${parsedPath.dir}/${parsedPath.name}_thumb${parsedPath.ext}`;
        return new Promise((resolve, reject) =>
            gm(imagePath).thumb(150, 150, `${thumbName}`, 100, err => {
                if (err) {
                    Logger.error(err);
                    reject(new Error(err));
                }
                Logger.info(thumbName);
                resolve(thumbName);
            })
        );
    });

    return Promise.all(promises);
};


exports.getDimensions = async (filePath) => {
    return new Promise((resolve, reject) => {
        gm(filePath)
            .size(function (err, size) {
                Logger.info(size)
                if (!err) {
                    return resolve({ width: size.width, height: size.height })
                }
                Logger.error(err)
                reject(err)
            });
    })
}

exports.isObjectId = id => {
    const regEx = /^[0-9a-fA-F]{24}$/;
    return id.match(regEx) && mongoose.Types.ObjectId.isValid(id);
};

exports.getIdQuery = (id, queryField) => {
    let query = {
        _id: id
    };
    let toQuery = 'slug'
    if (typeof queryField !== 'undefined')
        toQuery = [queryField]
    Logger.info(toQuery)
    if (!this.isObjectId(id))
        query = {
            [toQuery]: id
        };
    return query;
};



