const { TE, to } = require("./util.service");
// const xlsxtojson = require("xlsx-to-json-lc");
const XLSX = require("xlsx");
const fs = require('fs');
const mongoose = require("mongoose");
const Logger = require("../logger");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Product = require("../models/product");

exports.uploadExcel = async (file) => {
    try {
        // SKU ID	Department	Category	Item	Brand	Comparable	DESCRIPTION	Pack size	MRP	Margin	Margin %	Margin Slab
        if (!file) TE("No file uploaded");
        const workbook = XLSX.readFile(file.path);
        const sheet_name_list = workbook.SheetNames;
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
            header: ["SKU ID", "Department", "Category", "Item", "Brand", "Comparable", "DESCRIPTION", "Pack size", "MRP", "Margin", "Margin %", "Margin Slab"],
            skipHeader: true
        })
        const jsonResult = json.slice(2, json.length - 1);
        const [err, datadb] = await to(this.uploadToDb(jsonResult));
        if (err) TE(err.message)
        return datadb

    } catch (err) {
        TE(err.message)
    }
    finally {
        fs.unlink(file.path, (err => {
            if (err) console.error(err.message)
        }))
    }
}

exports.uploadToDbTransaction = async (data) => {
    let err, session;
    [err, session] = await to(mongoose.startSession());
    try {
        await session.startTransaction();
        if (err) TE(err.message);
        if (!session) TE("Error creating transaction in database");

        [err, categories] = await to(Category.insertMany(
            data.map(i => {
                return new Category({
                    name: i["Category"], status: "active"
                })
            }),
            { session }
        ));
        if (err) TE(err.message);
        await session.commitTransaction();
        await session.endSession();
        return categories;
    } catch (err) {
        // console.error('bad', err.message, session)
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }
        TE(err.message);
    }
}

exports.uploadToDb = async (data) => {
    await to(this.addCategories(data));
    await to(this.addBrands(data));
    await to(this.addSubcategories(data));
    await to(this.updateCatIdPaths());
    return true;
}

exports.addCategories = async (data) => {
    // await data.map(async i => {
    //     const [errA, duplicate] = await to(Category.findOne({ name: i["Department"] }));
    //     if (errA) Logger.error(errA.message);
    //     if (duplicate || errA) return;
    //     else {

    //         Logger.info(`category duplicate ${duplicate}, error: ${errA}`);
    //         const cat = new Category({
    //             name: i["Department"],
    //             status: "active"
    //         })
    //         const [errB, newcat] = await to(cat.save());
    //         if (errB) Logger.error(errB.message);
    //         return newcat
    //     }
    // });
    // return true;

    const [err, categories] = await to(Category.insertMany(
        data.map(i => {
            // const id = mongoose.Types.ObjectId
            return ({
                name: i["Department"], status: "active", 
            })
        }),
        { ordered: false }

    ))
    if (err) console.error(err);
    if (categories) return categories
}

exports.addSubcategories = async (data) => {
    const [err, bulkOps] = await to(Promise.all(data.map(async (i) => {
        const parent = await Category.findOne({ name: i["Department"] });
        if (parent) {
            return {
                insertOne: {
                    document: {
                        // _id:id,
                        idPath: [parent._id],
                        parent: parent._id,
                        name: i["Category"],
                        status: "active",
                    }
                }
            }
        }
        return null
    }).filter(i => i !== null)));
    if (bulkOps) {
        const [err, subCats] = await to(Category.bulkWrite(bulkOps, { ordered: false }));
        if (err) console.error(err);
        return subCats
    }

}

exports.updateCatIdPaths = async () => {
    const [err, categories] = await to(Category.find({}));
    if (categories && categories.length > 0) {
        const bulkOps = categories.map(i => {
            return ({
                updateOne: {
                    filter: { _id: i._id },
                    update: { $addToSet: { idPath: i._id } }
                }

            })
        })
        await to(Category.bulkWrite(bulkOps, {ordered:false}))
    }
    // await to(Category.update({},
    //     { $push: { idPath: "$_id" } }
    // ))

}

exports.addBrands = async (data) => {
    const [err, brands] = await to(Brand.insertMany(
        data.map(i => ({ name: i["Brand"], status: "active" })),
        { ordered: false }
    ))
    if (err) console.error(err)
    if (brands) return brands
}

exports.addProducts = async (data) => {

}
