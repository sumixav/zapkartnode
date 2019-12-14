const { users, check_list_answers, check_lists, budgets, vendors, tips }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const getDashboard = async (user) => {
    let dashboard={};
    dashboard['user'] = user;
    
  
   let dayleft = 0;
  
    let userDate = (user.weddingDate!=null)?new Date(user.weddingDate.toISOString().substring(0, 10)):null;
let currentdate = new Date();
if((userDate!=null)&&(currentdate < userDate) ) {
const diffTime = Math.abs(currentdate.getTime() - userDate.getTime());
dayleft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}
dashboard['weddingdayleft'] = dayleft;




    [err, checklistanswer] = await to(check_list_answers.findAll({
        where: [{ userId: user.id, statueId: [1,3]}]
    }
    ));
    if(err) { return err; }
    let checklist =[];
    if(checklistanswer.length > 0) {
        
        for (var data in checklistanswer) {
       
            checklist[data] = checklistanswer[data]['checkListId'];
            }
    }
    
    [err, checklistUserDetails] = await to(check_lists.findAll({
        where: [{ userId: user.id,id: {
            [Op.notIn]: checklist 
        }},{active:1,languageId:user.languageId}],
        limit:5
    }
    ));
    if(err) { return err; }
    
    let checklistAdminDetails = [];
    if(checklistUserDetails.length == 0) {

        [err, adminuser ] = await to(users.findAll({
            where: [{
           firstName: 'Admin'
       }]   
       }));
            if(err) TE(err.message);

        [err, checklistAdminDetails] = await to(check_lists.findAll({
            where: [{ userId: adminuser[0]['id'],id: {
                [Op.notIn]: checklist 
            }},{languageId:user.languageId},{active:1}],
            limit:5
        }
        ));
        if(err) { return err; }
    }

     
    dashboard['checklist'] = (checklistUserDetails.length == 0)?checklistAdminDetails:checklistUserDetails;
    
    [err, budgetDetails] = await to(budgets.findAll({
        where: [{ userId: user.id}]
    }
    ));
    if(err) { return err; }
    dashboard['budget'] = budgetDetails;

    [err, vendorDetails] = await to(vendors.findAll({
        where: [{languageId:user.languageId},{active:1}],
        order: [
            [Sequelize.literal('RAND()')]
        ],
        limit:5
    }
    ));
    if(err) { return err; }
    dashboard['vendor'] = vendorDetails;

    [err, tipDetails] = await to(tips.findAll({
        where: [{languageId:user.languageId},{active:1}],
        order: [
            [Sequelize.literal('RAND()')]
        ],
        limit:5
    }
    ));
    if(err) { return err; }
    dashboard['tip'] = tipDetails;

    return dashboard;
}

module.exports.getDashboard = getDashboard;
