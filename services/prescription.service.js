const { users, user_types, prescriptions } = require("../auth_models");
const {
    to,
    TE,
    saveThumbnail,
    resizeCrop
} = require("../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Logger = require("../logger");


const MAX_WIDTH =  null;
const MAX_HEIGHT = 700

module.exports.getPresDoc = (fileArray, userId) => {
    return Promise.all(
        fileArray.map(async i => {

            const thumbnail = i.mimetype === "application/pdf" ? i.path : await saveThumbnail(i.path);
            const url = i.mimetype === "application/pdf" ? i.path : await resizeCrop(i.path, MAX_WIDTH, MAX_HEIGHT);
            return {
                // url: i.path,
                url,
                thumbnail,
                userId: userId
            };
        })
    );
}
/**
 * bulk save uploaded prescription files to db
 * @param {Object} req request object 
 * @param {FileList} req.files.prescription 
 * @returns {Object[]} newly created files saved to db
 */
module.exports.savePrescriptions = async req => {
    Logger.info('savePrescriptions', req.user, req.files)
    if (
        req.user && req.files &&
        req.files["prescription"] &&
        req.files["prescription"].length > 0
    ) {
        const [errArr, presArray] = await to(this.getPresDoc(req.files["prescription"], req.user.id))
        if (errArr) TE(errArr.message)
        const [err, savedPres] = await to(prescriptions.bulkCreate(presArray));

        if (err) { console.error(err); TE(err.message) };
        if (!savedPres) TE("Error saving data");
        return savedPres;
    }
    return null;
};

/**
 * @param {string} userId 
 * @returns {Object[]} prescription list
 */
module.exports.getPrescriptionsFromUser = async (userId) => {
    const [err, list] = await to(prescriptions.findAll({
        where: {
            userId
        }
    }))
    if (err) TE(err.message);
    // if (!list || list.length === 0) TE(new Error('No prescriptions'));
    if (!list) TE(new Error('No prescriptions'));
    return list
}

/**
 * @param {Object} req represents reqest object 
 * @param {Object} req.user 
 * @param {Array} req.deleted
 */
module.exports.deletePrescriptions = async (req) => {
    Logger.info('req.deleted', req.body.deleted)
    if (req.body.deleted && req.body.deleted.length > 0) {
        const [err, presc] = await to(prescriptions.destroy({
            where: {
                userId: req.user.id,
                id: req.body.deleted
            }
        }))
        Logger.info(err, presc)
        if (err) TE(err.message)
        return presc
    }
    return null;
}

/**
 * @param {Object} req represents request object
 * @param {Object} req.user to use user.id
 * @param {FileList} req.files.prescription upload files
 * @param {string[]} req.body.deleted prescription ids to delete from db
 */
module.exports.updatePrescriptions = async (req) => {
    Logger.info('updatePres', req.user, req.files["prescription"])
    const [err, newPrescriptions] = await to(this.savePrescriptions(req))
    if (err) TE('Error saving prescriptions. ' + err.message);
    if (!newPrescriptions) Logger.info('No new prescriptions to save');

    Logger.info('newPrescriptions', newPrescriptions)
    // delete prescriptions from db
    const [delError, deletedCount] = await to(this.deletePrescriptions(req))
    if (delError) TE('Error deleting prescriptions. ' + delError.message)
    if (deletedCount === 0) Logger.info('Nothing to delete')
    if (deletedCount > 0) Logger.info('Deleted filenames from db')


    const [errDoc, pres] = await to(this.getPrescriptionsFromUser(req.user.id))
    if (errDoc) TE("Error while fetching after updating" + errDoc.message) 
    if (!pres) TE("No such data")
    return pres
}
