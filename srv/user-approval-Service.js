const cds = require('@sap/cds');
const moment = require('moment');
const { userActivationMail, userDeactivationMail, assignAsAdminMail, userApprovalMail, userRejectMail } = require('./mailer/mail.helper');
const bcrypt = require('bcryptjs');
const { generatePassword } = require('./utils/generator.js');
const { v4: uuid } = require('uuid');

module.exports = function () {
    const { CompanyUsers, CompanyUserRoles, CompanyMaster, CompanyGSTIN, CompanyGSTINAdresses, CompanyIATA, UserDefaultGSTIN, CompanyDocuments, AuditTrail, StateCodes } = this.entities;

    this.after('READ', 'CompanyUsers', async (data, req) => {
        const tx = cds.transaction(req);
        for (let i = 0; i < data.length; i++) {
            const element = data[i];

            switch (element.status) {
                case "D":
                    element.status = "Deactivated";
                    element.criticality = 1;
                    break;
                case "B":
                    element.status = "Blocked";
                    element.criticality = 1;
                    break;
                case "R":
                    element.status = "Rejected";
                    element.criticality = 1;
                    break;
                case "X":
                    element.status = "Rejected";
                    element.criticality = 1;
                    break;
                case "A":
                    element.status = "Activated / Approved";
                    element.criticality = 3;
                    break;
                case "P":
                    element.status = "Pending";
                    element.criticality = 2;
                case "I":
                    element.status = "Initiated";
                    element.criticality = 5;
                    break;
                default:
                    break;
            }
            const userRoles = await tx.run(SELECT.one`isAdmin`.from(CompanyUserRoles).where({
                companyId: element.companyId,
                userId: element.ID
            }));

            if (userRoles.isAdmin) {
                element.assignAsAdmin = true;
            } else {
                element.assignAsAdmin = false;
            }
            //         element.userName = `${element.title}  ${element.firstName} ${element.lastName}`;

        };

        return data
    });

    this.on("approveInitiatedUser", async (req) => {
        try {
            const tx = cds.transaction(req);

            const companyID = req.params[0];

            var user = req.user.id;

            const users = await tx.run(SELECT.one`ID,title,firstName,lastName,status,loginEmail`.from(CompanyUsers).where({
                companyId: companyID
            }));

            const companyMasterData = await tx.run(SELECT.one`status,companyName`.from(CompanyMaster).where({
                ID: companyID
            }));

            if (companyMasterData.status === 'A') return req.notify(`Company/The user is already approved.`);
            if (companyMasterData.status === 'X') return req.notify(`Approval denied for ${users.firstName}` + ' ' + `${users.lastName}. Company/User is rejected`);


            var password = generatePassword();
            let hashPassword = await bcrypt.hash(password, 12);

            await tx.run(UPDATE(CompanyUsers)
                .set({
                    status: 'A',
                    password: hashPassword
                })
                .where({
                    COMPANYID: companyID,
                    ID: users.ID
                }));


            await tx.run(UPDATE(CompanyMaster)
                .set({
                    status: 'A'
                })
                .where({
                    ID: companyID
                }));

            /**Audit Log*/
            const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
            const auditData = {
                ID: uuid(),
                companyCode: 'AI',
                userId: user,
                companyId: '',
                eventId: 'Approve',
                eventName: 'User / Company Approved',
                module: 'Company User',
                createdBy: user,
                createdAt: currentDateTime,
                finalStatus: 'Success',
                finalStatusMessageText: `Company ${companyMasterData.companyName} / User ${users.loginEmail} approved`,
                oldValue: '',
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);

            /** Trigger Mail */

            try {
                await userApprovalMail(`${users.firstName}` + ' ' + `${users.lastName}`, users.loginEmail, password);
            } catch (error) {
                console.log(error);
            }
            return req.notify(`Company/User approved.`);
        } catch (error) {
            console.log(error.message)
            req.error(500, 'Something went wrong, Try again');
        }
    });

    this.on("rejectInitiatedUser", async (req) => {
        try {
            const tx = cds.transaction(req);

            const companyID = req.params[0];
            const reason = req.data.reason;

            var user = req.user.id; var user = req.user.id;

            const users = await tx.run(SELECT.one`ID,title,firstName,lastName,status,loginEmail`.from(CompanyUsers).where({
                companyId: companyID
            }));

            if (!users) return;

            const companyMasterData = await tx.run(SELECT.one`status,companyName`.from(CompanyMaster).where({
                ID: companyID
            }));
            if (!companyMasterData) return;

            if (companyMasterData.status === 'X') return req.notify(`Company/User is already Rejected`);

            await tx.run(UPDATE(CompanyUsers)
                .set({
                    status: 'X',
                    reasonForDeactivation: reason
                })
                .where({
                    COMPANYID: companyID,
                    ID: users.ID
                }));


            await tx.run(UPDATE(CompanyMaster)
                .set({
                    status: 'X'
                })
                .where({
                    ID: companyID
                }));

            /**Audit Log*/
            const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
            const auditDataForNew = {
                ID: uuid(),
                companyCode: 'AI',
                userId: user,
                companyId: '',
                eventId: 'Reject',
                eventName: 'User / Company Rejection',
                module: 'Company User',
                createdBy: user,
                createdAt: currentDateTime,
                finalStatus: 'Success',
                finalStatusMessageText: `Company ${companyMasterData.companyName} / User ${users.loginEmail} rejected for reason : ${reason}`,
                oldValue: '',
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditDataForNew);

            /** Trigger Mail */

            try {
                await userRejectMail(`${users.firstName}` + ' ' + `${users.lastName}`, users.loginEmail, reason);
            } catch (error) {
                console.log(error);
            }
            return req.notify(`Company / User ${users.firstName}` + ' ' + `${users.lastName} Rejected`);
        } catch (error) {
            req.error(500, error.message);
        }
    });

    this.after('READ', 'initiatedUsers', async (data, req) => {
        try {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                if (element?.CategoryMaster?.code) {
                    if (element.CategoryMaster.code == '01' || element.CategoryMaster.code == '02' || element.CategoryMaster.code == '07') {
                        element.toggleIATACode = false;
                    } else {
                        element.toggleIATACode = true;
                    }

                    if (element.CategoryMaster.code == '02') {
                        element.toggleBasedOnAgent = false;
                    } else {
                        element.toggleBasedOnAgent = true;
                    }

                    if (element.CategoryMaster.code == '05' || element.CategoryMaster.code == '08' || element.CategoryMaster.code == '07') {
                        element.togglePAN = true;
                    } else {
                        element.togglePAN = false;
                    }

                    if (element.CategoryMaster.code == '07') {
                        element.toggleGSTIN = true;
                    } else {
                        element.toggleGSTIN = false;
                    }

                    if (element.isEcommerceOperator && element.CategoryMaster.code == '01' || element.CategoryMaster.code == '02') {
                        element.toggleTCS = false;
                    } else {
                        element.toggleTCS = true;
                    }
                }

                if (element?.status) {
                    if (element.status == 'I') {
                        element.toggleButton = false;
                    } else {
                        element.toggleButton = true;
                    }
                }

                switch (element?.status) {
                    case "D":
                        element.status = "Deactivated";
                        element.criticality = 1;
                        break;
                    case "B":
                        element.status = "Blocked";
                        element.criticality = 1;
                        break;
                    case "R":
                        element.status = "Rejected";
                        element.criticality = 1;
                    case "X":
                        element.status = "Rejected";
                        element.criticality = 1;
                        break;
                    case "A":
                        element.status = "Activated / Approved";
                        element.criticality = 3;
                        break;
                    case "P":
                        element.status = "Pending";
                        element.criticality = 2;
                    case "I":
                        element.status = "Initiated";
                        element.criticality = 5;
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            debugger;
        }
    });
    
    this.after('READ', 'CompanyMasters', async (data, req) => {
        try {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                switch (element?.status) {
                    case "D":
                        element.statusName = "Deactivated";
                        element.criticality = 1;
                        break;
                    case "B":
                        element.statusName = "Blocked";
                        element.criticality = 1;
                        break;
                    case "R":
                        element.statusName = "Rejected";
                        element.criticality = 1;
                    case "X":
                        element.statusName = "Rejected";
                        element.criticality = 1;
                        break;
                    case "A":
                        element.statusName = "Activated / Approved";
                        element.criticality = 3;
                        break;
                    case "P":
                        element.statusName = "Pending";
                        element.criticality = 2;
                    case "I":
                        element.statusName = "Initiated";
                        element.criticality = 5;
                        break;
                    default:
                        break;
                }
            }
            return data
        } catch (error) {
        }
    });

    this.on("getCSRFToken", (req) => {
        return "Token";
    });

    /**Edit - Process -Audit trail*/
    this.before('UPDATE', 'CompanyMasters', async (req) => {
        try {
            const editedData = req.data;
            const userEmail = req?.user?.id ?? "Air India";
            const originalData = await SELECT.one.from(CompanyMasters).where({ ID: editedData.ID });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /**
                     * diff => edited Data
                     * originalData => original Data
                     * CompanyId => ''
                     * EventId => 'Update','Create','Delete'
                     * EventName => 'Update password','Create amendment','Delete ....'
                     * Module => 'Profile','Amendment','Registration',....
                     * Created By => Email
                     * Created On = > Current Date
                     * Status => Success,Error,Warning,...
                     * FinalStatusMessageText => 'Company Name updated',...
                     * Old Value => old Value
                     * New Vale => New Value
                     * User => creted user
                     */
                    const auditData = {
                        companyCode: 'AI',
                        userId: userEmail,
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Customer Master',
                        createdBy: userEmail,
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: 'Updated',
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        let oldValue, newValue;
                        if (key == 'state') {
                            oldValue = await SELECT.one.from(StateCodes).where({ stateCode: originalData[key] });
                            oldValue = oldValue?.stateName;
                            newValue = await SELECT.one.from(StateCodes).where({ stateCode: diff[key] });
                            newValue = newValue?.stateName;
                        } else if (key == 'country_code') {
                            oldValue = getCountryDescription(originalData[key]) ?? '';
                            newValue = getCountryDescription(diff[key]) ?? '';
                        } else {
                            oldValue = originalData[key] ?? '';
                            newValue = diff[key] ?? '';
                        }
                        auditData.oldValue = oldValue ?? originalData[key];
                        auditData.newValue = newValue ?? diff[key];
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = getDescription(key) + ' ' + 'Updated' ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'CompanyUsers', async (req) => {
        try {
            const editedData = req.data;
            const userEmail = req?.user?.id ?? "Air India";
            const originalData = await SELECT.one.from(CompanyUsers).where({ ID: editedData.ID, companyId: editedData.companyId });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /**
                     * diff => edited Data
                     * originalData => original Data
                     * CompanyId => ''
                     * EventId => 'Update','Create','Delete'
                     * EventName => 'Update password','Create amendment','Delete ....'
                     * Module => 'Profile','Amendment','Registration',....
                     * Created By => Email
                     * Created On = > Current Date
                     * Status => Success,Error,Warning,...
                     * FinalStatusMessageText => 'Company Name updated',...
                     * Old Value => old Value
                     * New Vale => New Value
                     * User => creted user
                     */
                    const auditData = {
                        companyCode: 'AI',
                        userId: userEmail,
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Customer Master',
                        createdBy: userEmail,
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: `Updated`,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = getDescription(key) + ' ' + `Updated for ${originalData.loginEmail}` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'CompanyGSTIN', async (req) => {
        try {
            const editedData = req.data;
            const userEmail = req?.user?.id ?? "Air India";
            const originalData = await SELECT.one.from(CompanyGSTIN).where({ GSTIN: editedData.GSTIN, companyId: editedData.companyId });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /**
                     * diff => edited Data
                     * originalData => original Data
                     * CompanyId => ''
                     * EventId => 'Update','Create','Delete'
                     * EventName => 'Update password','Create amendment','Delete ....'
                     * Module => 'Profile','Amendment','Registration',....
                     * Created By => Email
                     * Created On = > Current Date
                     * Status => Success,Error,Warning,...
                     * FinalStatusMessageText => 'Company Name updated',...
                     * Old Value => old Value
                     * New Vale => New Value
                     * User => creted user
                     */
                    const auditData = {
                        companyCode: 'AI',
                        userId: userEmail,
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Customer Master',
                        createdBy: userEmail,
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: ``,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'CompanyGSTINAdresses', async (req) => {
        try {
            const editedData = req.data;
            const userEmail = req?.user?.id ?? "Air India";
            const originalData = await SELECT.one.from(CompanyGSTINAdresses).where({
                companyId: editedData.companyId, gstin: editedData.gstin, serialNo: editedData.serialNo,
                effectiveFrom: editedData.effectiveFrom
            });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /**
                     * diff => edited Data
                     * originalData => original Data
                     * CompanyId => ''
                     * EventId => 'Update','Create','Delete'
                     * EventName => 'Update password','Create amendment','Delete ....'
                     * Module => 'Profile','Amendment','Registration',....
                     * Created By => Email
                     * Created On = > Current Date
                     * Status => Success,Error,Warning,...
                     * FinalStatusMessageText => 'Company Name updated',...
                     * Old Value => old Value
                     * New Vale => New Value
                     * User => creted user
                     */
                    const auditData = {
                        companyCode: 'AI',
                        userId: userEmail,
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Customer Master',
                        createdBy: userEmail,
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: ``,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }
    });
}

function findDifference(original, edit) {
    return Object.keys(edit).reduce((diff, key) => {
        if (original[key] === edit[key]) return diff
        return {
            ...diff,
            [key]: edit[key]
        }
    }, {})
}

function getDescription(key) {
    return descriptions[key] || key;
}

function getCountryDescription(value) {
    return country[value] || value;
}

var descriptions = {
    agentCode: "IATA Code",
    companyName: "Company Name",
    companyRegistrationNumber: "Company Registration Number",
    companyPan: "Company PAN",
    companyTan: "Company TAN",
    address: "Address",
    country: "Country",
    country_code: "Country",
    state: "State",
    city: "City",
    pincode: "Pincode",
    contactNumber: "Contact Number",
    website: "Website",
    category: "Category",
    isEcommerceOperator: "Is Ecommerce Operator",
    consulateEmbassyCountry: "Consulate Embassy Country",
    unShortCode: "UN Short Code",
    status: "Status",
    title: "Title",
    firstName: "First Name",
    lastName: "Last Name",
    mobile: "Mobile",
    legalName: "Legal Name",
    tradeName: "Trade Name",
    country_code: "Country"
}

var country = {
    'AD': 'Andorra',
    'AE': 'United Arab Emirates',
    'AF': 'Afghanistan',
    'AG': 'Antigua and Barbuda',
    'AI': 'Anguilla',
    'AL': 'Albania',
    'AM': 'Armenia',
    'AO': 'Angola',
    'AQ': 'Antarctica',
    'AR': 'Argentina',
    'AS': 'American Samoa',
    'AT': 'Austria',
    'AU': 'Australia',
    'AW': 'Aruba',
    'AX': 'Aland Islands',
    'AZ': 'Azerbaijan',
    'BA': 'Bosnia and Herzegovina',
    'BB': 'Barbados',
    'BD': 'Bangladesh',
    'BE': 'Belgium',
    'BF': 'Burkina Faso',
    'BG': 'Bulgaria',
    'BH': 'Bahrain',
    'BI': 'Burundi',
    'BJ': 'Benin',
    'BL': 'Saint Barthelemy',
    'BM': 'Bermuda',
    'BN': 'Brunei Darussalam',
    'BO': 'Bolivia',
    'BQ': 'Bonaire, Sint Eustatius and Saba',
    'BR': 'Brazil',
    'BS': 'Bahamas',
    'BT': 'Bhutan',
    'BV': 'Bouvet Islands',
    'BW': 'Botswana',
    'BY': 'Belarus',
    'BZ': 'Belize',
    'CA': 'Canada',
    'CC': 'Cocos (Keeling) Islands',
    'CD': 'Democratic Republic of the Congo',
    'CF': 'Central African Republic',
    'CG': 'Republic of the Congo',
    'CH': 'Switzerland',
    'CI': "Cote d'Ivoire",
    'CK': 'Cook Islands',
    'CL': 'Chile',
    'CM': 'Cameroon',
    'CN': 'China',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'CV': 'Cape Verde',
    'CW': 'Curacao',
    'CX': 'Christmas Island',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DE': 'Germany',
    'DJ': 'Djibouti',
    'DK': 'Denmark',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'DZ': 'Algeria',
    'EC': 'Ecuador',
    'EE': 'Estonia',
    'EG': 'Egypt',
    'EH': 'Western Sahara',
    'ER': 'Eritrea',
    'ES': 'Spain',
    'ET': 'Ethiopia',
    'FI': 'Finland',
    'FJ': 'Fiji',
    'FK': 'Falkland Islands',
    'FM': 'Micronesia',
    'FO': 'Faroe Islands',
    'FR': 'France',
    'GA': 'Gabon',
    'GB': 'United Kingdom',
    'GD': 'Grenada',
    'GE': 'Georgia',
    'GF': 'French Guyana',
    'GG': 'Guernsey (Channel Islands)',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GL': 'Greenland',
    'GM': 'Gambia',
    'GN': 'Guinea',
    'GP': 'Guadeloupe',
    'GQ': 'Equatorial Guinea',
    'GR': 'Greece',
    'GS': 'South Georgia and the Southern Sandwich Islands',
    'GT': 'Guatemala',
    'GU': 'Guam',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HK': 'Hong Kong',
    'HM': 'Heard and McDonald Islands',
    'HN': 'Honduras',
    'HR': 'Croatia',
    'HT': 'Haiti',
    'HU': 'Hungary',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IM': 'Isle of Man',
    'IN': 'India',
    'IO': 'British Indian Ocean Territory',
    'IQ': 'Iraq',
    'IS': 'Iceland',
    'IT': 'Italy',
    'JE': 'Jersey',
    'JM': 'Jamaica',
    'JO': 'Jordan',
    'JP': 'Japan',
    'KE': 'Kenya',
    'KG': 'Kyrgyzstan',
    'KH': 'Cambodia',
    'KI': 'Kiribati',
    'KM': 'Comoros',
    'KN': 'Saint Kitts and Nevis',
    'KR': 'South Korea',
    'KW': 'Kuwait',
    'KY': 'Cayman Islands',
    'KZ': 'Kazakhstan',
    'LA': 'Laos',
    'LB': 'Lebanon',
    'LC': 'St. Lucia',
    'LI': 'Liechtenstein',
    'LK': 'Sri Lanka',
    'LR': 'Liberia',
    'LS': 'Lesotho',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'LV': 'Latvia',
    'LY': 'Libya',
    'MA': 'Morocco',
    'MC': 'Monaco',
    'MD': 'Moldova',
    'ME': 'Montenegro',
    'MF': 'Saint Martin',
    'MG': 'Madagascar',
    'MH': 'Marshall Islands',
    'MK': 'Republic of North Macedonia',
    'ML': 'Mali',
    'MM': 'Burma',
    'MN': 'Mongolia',
    'MO': 'Macau',
    'MP': 'North Mariana Islands',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MS': 'Montserrat',
    'MT': 'Malta',
    'MU': 'Mauritius',
    'MV': 'Maldives',
    'MW': 'Malawi',
    'MX': 'Mexico',
    'MY': 'Malaysia',
    'MZ': 'Mozambique',
    'NA': 'Namibia',
    'NC': 'New Caledonia',
    'NE': 'Niger',
    'NF': 'Norfolk Islands',
    'NG': 'Nigeria',
    'NI': 'Nicaragua',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'NP': 'Nepal',
    'NR': 'Nauru',
    'NU': 'Niue',
    'NZ': 'New Zealand',
    'OM': 'Oman',
    'PA': 'Panama',
    'PE': 'Peru',
    'PF': 'French Polynesia',
    'PG': 'Papua New Guinea',
    'PH': 'Philippines',
    'PK': 'Pakistan',
    'PL': 'Poland',
    'PM': 'St. Pierre and Miquelon',
    'PN': 'Pitcairn Islands',
    'PR': 'Puerto Rico',
    'PS': 'Palestine',
    'PT': 'Portugal',
    'PW': 'Palau',
    'PY': 'Paraguay',
    'QA': 'Qatar',
    'RE': 'Reunion',
    'RO': 'Romania',
    'RS': 'Serbia',
    'RU': 'Russian Federation',
    'RW': 'Rwanda',
    'SA': 'Saudi Arabia',
    'SB': 'Solomon Islands',
    'SC': 'Seychelles',
    'SD': 'Sudan',
    'SE': 'Sweden',
    'SG': 'Singapore',
    'SH': 'Saint Helena',
    'SI': 'Slovenia',
    'SJ': 'Svalbard',
    'SK': 'Slovakia',
    'SL': 'Sierra Leone',
    'SM': 'San Marino',
    'SN': 'Senegal',
    'SO': 'Somalia',
    'SR': 'Suriname',
    'SS': 'South Sudan',
    'ST': 'Sao Tome and Principe',
    'SV': 'El Salvador',
    'SX': 'Sint Maarten (Dutch part)',
    'SZ': 'Kingdom of Eswatini',
    'TC': 'Turks and Caicos Islands',
    'TD': 'Chad',
    'TF': 'French Southern and Antarctic Lands',
    'TG': 'Togo',
    'TH': 'Thailand',
    'TJ': 'Tajikistan',
    'TK': 'Tokelau Islands',
    'TL': 'East Timor',
    'TM': 'Turkmenistan',
    'TN': 'Tunisia',
    'TO': 'Tonga',
    'TP': 'East Timor',
    'TR': 'Turkey',
    'TT': 'Trinidad and Tobago',
    'TV': 'Tuvalu',
    'TW': 'Taiwan',
    'TZ': 'Tanzania',
    'UA': 'Ukraine',
    'UG': 'Uganda',
    'UM': 'United States Minor Outlying Islands',
    'US': 'United States',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VA': 'Vatican City',
    'VC': 'St. Vincent and the Grenadines',
    'VE': 'Venezuela',
    'VG': 'British Virgin Islands',
    'VI': 'United States Virgin Islands',
    'VN': 'Vietnam',
    'VU': 'Vanuatu',
    'WF': 'Wallis and Futuna Islands',
    'WS': 'Samoa',
    'YE': 'Yemen',
    'YT': 'Mayotte',
    'ZA': 'South Africa',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe',
    'IR': 'Iran'
};
