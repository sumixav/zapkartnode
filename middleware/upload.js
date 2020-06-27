const multer = require("multer");
const fs = require("fs");
const Logger = require("../logger");

const getStorage = (location = null) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const newDestination = `./uploads/${location}/`;
            // console.log('dest file')
            let stat = null;
            try {
                stat = fs.statSync(newDestination);
            } catch (err) {
                fs.mkdirSync(newDestination);
            }
            if (stat && !stat.isDirectory()) {
                throw new Error(
                    'Directory cannot be created because an inode of a different type exists at "' +
                    dest +
                    '"'
                );
            }

            cb(null, newDestination);
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString() + file.originalname);
        }
    });

// const fileFilter = (req, file, cb) => {
//     Logger.info(file.mimetype);
//     console.log('jiji', req);
//     if (file.fieldname === 'prescription') {
//         filter(/image\/jpeg|image\/jpg|image\/png|application\/pdf/, file, cb);
//     }
//     else {
//         filter(/image\/jpeg|image\/jpg|image\/png/, file, cb);
//     }
//     // if (
//     //     file.mimetype === "image/png" ||
//     //     file.mimetype === "image/jpeg" ||
//     //     req.files['prescription'] && file.mimetype === "application/pdf"
//     // ) {
//     //     cb(null, true); // accept file
//     // } else {
//     //     Logger.error("invalid file type");
//     //     // cb(null, false) // reject file
//     //     cb(new Error("invalid file type"), false); // reject file
//     // }
// };


const filter = (mimetypes, file, cb) => {
    if (mimetypes.test(file.mimetype))
        cb(null, true)
    else {
        cb(new Error(`Invalid file type. Required: ${mimetypes}`), false)
        // mimetypes.replace(/^\/?|\/?$/, "")

    }

}


const upload = (location, type = null) =>
    multer({
        storage: getStorage(location),
        fileFilter: (req, file, cb) => {
            Logger.info(file.mimetype);
            if (type === 'excel') {
                if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
                    return cb(new Error('Wrong extension type. Required xls/xlsx'));
                }
                cb(null, true);
            }
            else {
                if (file.fieldname === 'prescription') {
                    filter(/image\/jpeg|image\/jpg|image\/png|application\/pdf/, file, cb);
                }
                else {
                    filter(/image\/jpeg|image\/jpg|image\/png/, file, cb);
                }
            }
        },
        onError: function (err, next) {
            Logger.info('FILE UPLOAD ERROR', err)
        }
    });

module.exports = { upload };
