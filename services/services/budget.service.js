const { budget_mini_statements, budgets, users, statues }  = require('../models');
const validator     = require('validator');
const { to, TE , ReE, ReS}    = require('../services/util.service');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const storeBudgetlist = async (paramInfo, user) => {

    let budgetParam = {'userId':user.id,
    'totalAmount':paramInfo.totalAmount,
    'remainingAmount': paramInfo.totalAmount,
    };
    [err, budgetDetails] = await to(budgets.create(budgetParam));
    if(err) { return err; }
    return budgetDetails; 
}

module.exports.storeBudgetlist = storeBudgetlist;

const getBudgetById = async (id, user) => {
    [err, budgetlist] = await to(budgets.findById(id, {
        include: [
            { model :budget_mini_statements,
where: [{ active:1 }]
  },
            { model :users  }
         ]
        }));
    if(err) { return err; }
    return budgetlist;
}

module.exports.getBudgetById = getBudgetById;

const updateBudgetService = async (id, param) => {
    budgetData = budgetBodyParam(param.body);
    budgetData.userId=param.user.id;
        
    [err,budgetupdate ] = await to(budgets.update(budgetData, {where: {id: id} }));
        if(err) TE(err.message);
    return budgetupdate;
}

module.exports.updateBudgetService = updateBudgetService;

const budgetBodyParam =  (params) => {
    
    let budget ={};
    for (var data in params) {
       
        budget[data] = params[data];
        }
    return budget;
    
}

module.exports.budgetBodyParam = budgetBodyParam;

const getBudgetDetails = async (user) => {
    [err, budgetlist] = await to(budgets.findAll({
        where: [{ userId: user.id }],
        limit:1,
        include: [
            { model :budget_mini_statements ,
                required:false,
where: [{ active:1 }] },
            { model :users  }
         ]
    }));
    if(err) { return err; }
    return budgetlist;
}

module.exports.getBudgetDetails = getBudgetDetails;

const storeBudgetMinilist = async (paramInfo) => {

    let budgetParam = {budgetId:paramInfo.budget,
        name:paramInfo.name,
        spentAmount:paramInfo.spentAmount,
        languageId:paramInfo.language,
        active:paramInfo.active
    };
    [err, budgetDetails] = await to(budget_mini_statements.create(budgetParam));
    if(err) { return err; }
    return budgetDetails; 
}

module.exports.storeBudgetMinilist = storeBudgetMinilist;

const updateBudgetMiniService = async (id, param) => {
    budgetData = budgetBodyParam(param);
  
        
    [err,budgetminiupdate ] = await to(budget_mini_statements.update(budgetData, {where: {id: id} }));
        if(err) TE(err.message);
    return budgetminiupdate;
}

module.exports.updateBudgetMiniService = updateBudgetMiniService;
