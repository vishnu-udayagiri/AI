const {
    v4: uuid
} = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const {
    isValidValue
} = require('../helpers/common.helper');


/**
 * Function to create audit log.
 * - Logs data to the ***AUDITTRAIL*** table.
 * - If ***item**, **attributeName**, **oldValue** and **newValue*** is provided, it will be added in the ***AUDITTRAILITEMS*** table.
 * 
 * @function
 * @param {Object} db - Description for db.
 * @param {Object} input - The input JSON object.
 * @param {string} input.companyCode - Description for companyCode.
 * @param {string} input.module - Description for module.
 * @param {string} input.eventId - Description for eventId.
 * @param {string} input.userId - Description for userId.
 * @param {string} [input.eventName] - Description for eventName. (optional)
 * @param {string} [input.businessDocumentId] - Description for businessDocumentId. (optional)
 * @param {string} [input.finalStatus] - Description for finalStatus. (optional)
 * @param {string} [input.finalStatusMessageText] - Description for finalStatusMessageText. (optional)
 * @param {Object} input.item - Description for item.
 * @param {string} [input.attributeName] - Description for attributeName. (optional)
 * @param {string} [input.oldValue] - Description for oldValue. (optional)
 * @param {string} [input.newValue] - Description for newValue. (optional)
 * @param {boolean} item - Default value will be **false**. **true** -> Item data is present. **false** -> Item data is not present.
 * @returns {void} This function returns nothing.
 */

exports.auditlog = (db, input, item = false) => {

    const notNullItems = [
        "companyCode",
        "companyId",
        "module",
        "eventId",
        "userId",
    ]

    if (item) {
        notNullItems.push("item")
    }


    for (const item of notNullItems) {
        if (!input.hasOwnProperty(item)) {
            throw new Error(`${item} cannot be empty`)
        }
        if (input.hasOwnProperty(item) && (input[item] == "" || !input[item])) {
            throw new Error(`${item} cannot be null or undefined`)
        }
    }

    const logId = uuid()
    const user = input.userId
    const createdAt = new Date().toISOString().replace('T', ' ').split('.')[0];

    const _auditTrailData = {
        ID: logId,
        companyCode: input.companyCode ?? "",
        companyId: input.companyId ?? "",
        module: input.module ?? "",
        eventId: input.eventId ?? "",
        eventName: input.eventName ?? "",
        businessDocumentId: input.businessDocumentId ?? "",
        finalStatus: input.finalStatus ?? "",
        finalStatusMessageText: input.finalStatusMessage ?? "",
        userId: user,
        createdAt: createdAt ?? "",
        createdBy: user,
        modifiedAt: createdAt ?? "",
        modifiedBy: user ?? "",
        attributeName: input.attributeName ?? "",
        oldValue: input.oldValue ?? "",
        newValue: input.newValue ?? "",
    }

    const auditTrailData = _.pickBy(_auditTrailData, isValidValue)

    // const _auditTrailItems = {
    //     auditID: logId,
    //     item: input.item??"",
    //     businessDocumentId: input.businessDocumentId??"",

    // }

    // const auditTrailItems = _.pickBy(_auditTrailItems, isValidValue)


    const auditTrailColumns = Object.keys(auditTrailData).map(item => item.toUpperCase()).join(",")
    const auditTrailValues = Object.values(auditTrailData)
    const auditTrailPlaceholders = Object.keys(auditTrailData).map(() => '?').join(',');
    const query = `INSERT INTO AUDITTRAIL (${auditTrailColumns}) VALUES (${auditTrailPlaceholders})`

    // console.log(auditTrailColumns,auditTrailValues);

    db.exec(query, auditTrailValues)

    // if (item && Object.keys(auditTrailItems).length > 1) {

    //     const auditTrailItemsColumns = Object.keys(auditTrailItems).map(item => item.toUpperCase()).join(",")
    //     const auditTrailItemsValues = Object.values(auditTrailItems)
    //     const auditTrailItemsPlaceholders =  Object.keys(auditTrailItems).map(() => '?').join(',');
    //     const itemQuery = `INSERT INTO AUDITTRAIL (${auditTrailItemsColumns}) VALUES (${auditTrailItemsPlaceholders})`

    //     db.exec(itemQuery, auditTrailItemsValues)

    // }



}