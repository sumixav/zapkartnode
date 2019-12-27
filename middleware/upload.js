const multer = require("multer");
const fs = require("fs");
const Logger = require("../logger");

const getStorage = (location = null) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const newDestination = `./uploads/${location}/`;
            // console.log('dest file')
            var stat = null;
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

const fileFilter = (req, file, cb) => {
    Logger.info(file.mimetype);
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true); // accept file
    } else {
        Logger.error("invalid file type");
        // cb(null, false) // reject file
        cb(new Error("invalid file type"), false); // reject file
    }
};


const upload = location =>
    multer({
        storage: getStorage(location),
        fileFilter
    });

module.exports = { upload };
