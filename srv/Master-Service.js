const cds = require('@sap/cds');
const moment = require('moment');
const { v4: uuid } = require('uuid');
const { getDescription } = require('./files/description')
module.exports = function () {
    const { AuditTrail, EMDRules, AgentMaster, AirportCodes, ConsulateEmbassyMaster, FeeCodes, EMDRFISC, FOP, TaxCodes, TaxCompositions, TaxRates, TaxRules, TransactionTypes, UNBodyMaster, StateCodes } = this.entities;

    this.on('CREATE', 'TaxRates', async (req) => {
        const { taxCode,
            taxType,
            validFrom,
            validTo,
            rate,
            taxBase } = req.data;
        const previousRates = await SELECT.one.from('TaxRates').where({ taxCode: taxCode, taxType: taxType }).orderBy({ validFrom: 'desc' });
        try {
            const updatedData = await UPSERT.into('TaxRates').entries(req.data);
            if (previousRates) {
                await UPDATE('TaxRates').set({ validTo: moment(validFrom).subtract(1, 'days').format("YYYY-MM-DD") }).where({ taxCode: taxCode, taxType: taxType, validFrom: previousRates.validFrom });
            }
            req.reply(req.data);
        } catch (err) {
            req.error(err.message);
        }
    });


    this.before('CREATE', 'GstExemptedZones', async (req) => {

        const { GstExemptedZone } = req.data;
        //check if validTo is less than validFrom with moment if so return error
        function validateValue(value) {
            return value === '0' || value === '1';
        }

        if (!validateValue(GstExemptedZone)) {
            req.error(400, "Accepted Values '0' and '1' for GST Exempted Zone");
        }
    });

    this.before('UPDATE', 'GstExemptedZones', async (req) => {

        const { GstExemptedZone } = req.data;
        //check if validTo is less than validFrom with moment if so return error
        function validateValue(value) {
            return value === '0' || value === '1';
        }

        if (!validateValue(GstExemptedZone)) {
            req.error(400, "Accepted Values '0' and '1' for GST Exempted Zone");
        }
    });

    this.before('CREATE', 'FeeCodes', async (req) => {

        const { validFrom, validTo } = req.data;
        //check if validFrom is less than today with moment if so return error
        if (moment(validFrom).isBefore(moment().format("YYYY-MM-DD"))) {
            req.error(400, 'Valid From must be present or future date');
        }
        //check if validTo is less than validFrom with moment if so return error
        if (moment(validTo).isBefore(moment(validFrom).format("YYYY-MM-DD"))) {
            req.error(400, 'Valid To must be greater than Valid From');
        }

    });

    /**EMD Rules */
    this.before('CREATE', 'EMDRules', async (req) => {
        const {
            company,
            code,
            validFrom,
            validityTill,
            RFISC,
            intrastate,
            isUT,
            b2b,
            IsSEZ } = req.data;

        if (validityTill) {
            //check if validTo is less than validFrom with moment if so return error
            if (moment(validityTill).isBefore(moment(validFrom).format("YYYY-MM-DD"))) {
                req.error(400, 'Validity Date must be greater than Valid From');
            }
        }
        ruleId = RFISC + intrastate + isUT + b2b + IsSEZ;
        req.data.ruleId = ruleId;

        const tx = cds.transaction(req);
        try {
            const maxSerialNo = await tx.run(`SELECT MAX(SLNO) as "maxSlNo" FROM EMDRULES WHERE RFISC = '${RFISC}' AND COMPANY ='${company}' AND code = '${code}' AND validFrom = '${validFrom}'`);
            if (maxSerialNo?.[0]?.maxSlNo) {
                req.data.slno = parseInt(maxSerialNo[0].maxSlNo) + 1;
            } else {
                req.data.slno = 1;
            }
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create EMD Rule`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `EMD Rule ${ruleId} Created`,
                oldValue: '',
                newValue: `${ruleId}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
        }
    });

    this.before('UPDATE', 'EMDRules', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(EMDRules).where({
                company: editedData.company, code: editedData.code, validFrom: editedData.validFrom,
                slno: editedData.slno
            });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
        }

    });

    this.before('DELETE', 'EMDRules', async (req) => {
        try {
            const { RFISC, slno } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete EMD Rule`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `EMD Rule for RFISC : ${RFISC} SlNo. : ${slno} Deleted`,
                oldValue: `${ruleId ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    // this.on('error', 'EMDRules', async (err, req) => {
    //     try {
    //         if (err?.details?.length > 0) {
    //             err.details.forEach(element => {
    //                 if (element.message = 'ASSERT_ENUM') {
    //                     element.message = `Value ${element.args[0]} is invalid suggested values :  ${element.args[1]}, ${element.args[2]}`;
    //                 }
    //             });
    //         } else if (err?.message) {
    //             if (err.message == 'ASSERT_ENUM') {
    //                 err.message = `Value ${err.args[0]} is invalid suggested values :  ${element.args[1]}, ${element.args[2]}`;
    //             }
    //         }
    //     } catch (error) {
    //         debugger;
    //     }
    // });

    /**Agent Master */
    this.before('CREATE', 'AgentMaster', async (req) => {
        const { iataNumber } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Agent`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Agent ${iataNumber} Created`,
                oldValue: '',
                newValue: `${iataNumber}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'AgentMaster', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(AgentMaster).where({ iataNumber: editedData.iataNumber });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Agent Master - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Agent Master - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'AgentMaster', async (req) => {
        try {
            const { iataNumber } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Agent Master - ${iataNumber}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${iataNumber} Deleted`,
                oldValue: `${iataNumber ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**Air India GSTIN Details */
    this.before('CREATE', 'AirportCodes', async (req) => {
        const { airportCode } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Air India GSTIN Detail`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Air India GSTIN Detail ${airportCode} Created`,
                oldValue: '',
                newValue: `${airportCode}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'AirportCodes', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(AirportCodes).where({ airportCode: editedData.airportCode });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: ``,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        if (key == 'isDomestic' || key == 'isUT') {
                            originalData[key] = originalData[key] == 0 ? "false" : "true";
                            diff[key] = diff[key] == 0 ? "false" : "true";
                        }
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + 'Air India GSTIN Detail - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Air India GSTIN Detail - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'AirportCodes', async (req) => {
        try {
            const { airportCode } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Air India GSTIN Detail - ${airportCode}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${airportCode} Deleted`,
                oldValue: `${airportCode ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /** Consulate Embassy Master */
    this.before('CREATE', 'ConsulateEmbassyMaster', async (req) => {
        const { gstinUIN } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Consulate / Embassy`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Consulate / Embassy ${gstinUIN} Created`,
                oldValue: '',
                newValue: `${gstinUIN}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'ConsulateEmbassyMaster', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(ConsulateEmbassyMaster).where({ gstinUIN: editedData.gstinUIN });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Consulate / Embassy - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Consulate / Embassy - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'ConsulateEmbassyMaster', async (req) => {
        try {
            const { gstinUIN } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Consulate / Embassy - ${gstinUIN}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${gstinUIN} Deleted`,
                oldValue: `${gstinUIN ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**Airline Codes and Fee Codes */
    this.before('CREATE', 'FeeCodes', async (req) => {
        const { feeCode } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Airline Tax Code / Fee Code`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Airline Tax Code / Fee Code ${feeCode} Created`,
                oldValue: '',
                newValue: `${feeCode}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'FeeCodes', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(FeeCodes).where({ feeCode: editedData.feeCode });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Airline Tax Code & Fee Code - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Airline Tax Code & Fee Code - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'FeeCodes', async (req) => {
        try {
            const { feeCode } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Airline Tax Code / Fee Code - ${feeCode}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${feeCode} Deleted`,
                oldValue: `${feeCode ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**EMD RFISC */
    this.before('CREATE', 'EMDRFISC', async (req) => {
        const { RFISC } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create EMD RFISC`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `EMD RFISC ${RFISC} Created`,
                oldValue: '',
                newValue: `${RFISC}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'EMDRFISC', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(EMDRFISC).where({ RFISC: editedData.RFISC });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: ``,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        if (key == 'isAssociated' || key == 'GSTApplicable' || key == 'isComposite' || key == 'isCabinDependent' || key == 'linkedToTaxcode' || key == 'isAirportSpecific') {
                            originalData[key] = originalData[key] == 0 ? "false" : "true";
                            diff[key] = diff[key] == 0 ? "false" : "true";
                        }
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + 'EMD RFISC - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'EMD RFISC - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'EMDRFISC', async (req) => {
        try {
            const { RFISC } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete EMD RFISC - ${RFISC}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${RFISC} Deleted`,
                oldValue: `${RFISC ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    // this.on('error', 'EMDRFISC', async (err, req) => {

    //     if (err?.details?.length > 0) {
    //         err.details.forEach(element => {
    //             if (element.message = 'ASSERT_ENUM') {
    //                 element.message = `Value ${element.args[0]} is invalid suggested values :  {${element.args[1]}}`;
    //             }
    //         });
    //     } else if (err?.message) {
    //         if (err.message == 'ASSERT_ENUM') {
    //             err.message = `Value ${err.args[0]} is invalid suggested values :  {${err.args[1]}}`;
    //         }
    //     }
    // });

    /**FOP */
    this.before('CREATE', 'FOP', async (req) => {
        const { FOP } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create FOP`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `FOP - ${FOP} Created`,
                oldValue: '',
                newValue: `${FOP}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'FOP', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(FOP).where({ FOP: editedData.FOP });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: ``,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        if (key == 'isGSTApplicable') {
                            originalData[key] = originalData[key] == 0 ? "false" : "true";
                            diff[key] = diff[key] == 0 ? "false" : "true";
                        }
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + 'FOP - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'FOP - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'FOP', async (req) => {
        try {
            const { FOP } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete FOP - ${FOP}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${FOP} Deleted`,
                oldValue: `${FOP ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**Tax Codes */
    this.before('CREATE', 'TaxCodes', async (req) => {
        const { taxCode } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Tax Code`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Tax Code - ${taxCode} Created`,
                oldValue: '',
                newValue: `${taxCode}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'TaxCodes', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(TaxCodes).where({ taxCode: editedData.taxCode });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Tax Code - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Tax Code - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'TaxCodes', async (req) => {
        try {
            const { taxCode } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Tax Code - ${taxCode}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${taxCode} Deleted`,
                oldValue: `${taxCode ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**Tax Compositions */
    this.before('CREATE', 'TaxCompositions', async (req) => {
        const { taxType } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Tax Composition`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Tax Composition - ${taxType} Created`,
                oldValue: '',
                newValue: `${taxType}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'TaxCompositions', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(TaxCompositions).where({ taxType: editedData.taxType });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Tax Composition - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Tax Composition - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'TaxCompositions', async (req) => {
        try {
            const { taxType } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Tax Composition - ${taxType}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${taxType} Deleted`,
                oldValue: `${taxType ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**Tax Rates */
    this.before('CREATE', 'TaxRates', async (req) => {
        const { taxCode, taxType, validFrom, validTo, rate, taxBase } = req.data;
        //check if validFrom is less than today with moment if so return error
        if (validFrom) {
            if (moment(validFrom).isBefore(moment().format("YYYY-MM-DD"))) {
                return req.error(400, 'Valid From must be present or future date');
            }
        }
        //check if validTo is less than validFrom with moment if so return error
        if (validTo && validFrom) {
            if (moment(validTo).isBefore(moment(validFrom).format("YYYY-MM-DD"))) {
                return req.error(400, 'Valid To must be greater than Valid From');
            }
        }
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Tax Rate`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Tax Rate - ${rate} for ${taxCode} and  ${taxType} Created`,
                oldValue: '',
                newValue: `${rate}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'TaxRates', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(TaxRates).where({ taxCode: editedData.taxCode });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Tax Rate - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Tax Rate - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'TaxRates', async (req) => {
        try {
            const { rate, taxCode, taxType } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Tax Rate - ${taxCode}-${taxType}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Tax Rate - ${taxCode}-${taxType} Deleted`,
                oldValue: `${taxCode ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /**Tax Rules */
    this.before('CREATE', 'TaxRules', async (req) => {
        const { validFrom, validTo, ticketClass, eindia, exemptedZone, b2b, IsSEZ, intrastate } = req.data;
        const ruleId = ticketClass + eindia + exemptedZone + b2b + IsSEZ + intrastate;
        //check if validFrom is less than today with moment if so return err

        //check if validTo is less than validFrom with moment if so return error
        if (moment(validTo).isBefore(moment(validFrom).format("YYYY-MM-DD"))) {
            return req.error(400, 'Valid To must be greater than Valid From');
        }

        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Tax Rule`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Tax Rule ${ruleId} Created`,
                oldValue: '',
                newValue: `${ruleId}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'TaxRules', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(TaxRules).where({
                eindia: editedData.eindia,
                exemptedZone: editedData.exemptedZone,
                b2b: editedData.b2b,
                IsSEZ: editedData.IsSEZ,
                intrastate: editedData.intrastate,
                isUT: editedData.isUT,
                validFrom: editedData.validFrom
            });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Tax Rule - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Tax Rule - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }

    });

    this.before('DELETE', 'TaxRules', async (req) => {
        try {

            const { validFrom, validTo, ticketClass, eindia, exemptedZone, b2b, IsSEZ, intrastate } = req.data;
            const ruleId = ticketClass + eindia + exemptedZone + b2b + IsSEZ + intrastate;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Tax Rule - ${ruleId}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `${ruleId} Deleted`,
                oldValue: `${ruleId ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    // this.on('error', 'TaxRules', async (err, req) => {
    //     if (err?.details?.length > 0) {
    //         err.details.forEach(element => {
    //             if (element.message = 'ASSERT_ENUM') {
    //                 element.message = `Value ${element.args[0]} is invalid suggested values :  {${element.args[1]}}`;
    //             }
    //         });
    //     } else if (err?.message) {
    //         if (err.message == 'ASSERT_ENUM') {
    //             err.message = `Value ${err.args[0]} is invalid suggested values :  {${err.args[1]}}`;
    //         }
    //     }
    // });

    this.on('CREATE', 'TaxRules', async (req) => {
        const {
            validFrom, validTo, ticketClass, eindia,
            exemptedZone, b2b, IsSEZ, intrastate } = req.data;
        const ruleId = ticketClass + eindia + exemptedZone + b2b + IsSEZ + intrastate;
        req.data.ruleId = ruleId;
        return req;
    });

    /** Transaction Codes */
    this.before('CREATE', 'TransactionTypes', async (req) => {
        const { transactionType } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create Transaction Code`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Transaction Code - ${transactionType} Created`,
                oldValue: '',
                newValue: `${transactionType}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'TransactionTypes', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(TransactionTypes).where({ transactionType: editedData.transactionType });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'Transaction Code - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Transaction Code - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }
    });

    this.before('DELETE', 'TransactionTypes', async (req) => {
        try {
            const { transactionType } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete Transaction Code - ${transactionType}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `Transaction Code - ${transactionType} Deleted`,
                oldValue: `${transactionType ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    /** UN Body Master */
    this.before('CREATE', 'UNBodyMaster', async (req) => {
        const { gstinUIN } = req.data;
        try {
            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Create',
                eventName: `Create UN Body`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `UN Body - ${gstinUIN} Created`,
                oldValue: '',
                newValue: `${gstinUIN}`
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }
    });

    this.before('UPDATE', 'UNBodyMaster', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(UNBodyMaster).where({ gstinUIN: editedData.gstinUIN });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
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
                        auditData.eventName = auditData.eventId + ' ' + 'UN Body - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'UN Body - ' + getDescription(key) + ' ' + `Updated` ?? '';

                        await INSERT.into(AuditTrail).entries(auditData);
                    }
                }
            }
        } catch (error) {
            debugger;
        }
    });

    this.before('DELETE', 'UNBodyMaster', async (req) => {
        try {
            const { gstinUIN } = req.data;

            const auditData = {
                companyCode: 'AI',
                userId: req.user.id ?? 'Air India',
                companyId: '',
                eventId: 'Delete',
                eventName: `Delete UN Body - ${gstinUIN}`,
                module: 'Master Data',
                createdBy: req.user.id ?? 'Air India',
                createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                finalStatus: 'Success',
                finalStatusMessageText: `UN Body - ${gstinUIN} Deleted`,
                oldValue: `${gstinUIN ?? ''}`,
                newValue: ''
            }
            await INSERT.into(AuditTrail).entries(auditData);
        } catch (error) {
            debugger;
        }

    });

    this.before('UPDATE', 'StateCodes', async (req) => {
        try {
            const editedData = req.data;
            const originalData = await SELECT.one.from(StateCodes).where({ stateCode: editedData.stateCode });
            if (Object.keys(editedData).length > 0 && Object.keys(originalData).length > 0) {
                const diff = findDifference(originalData, editedData);
                if (Object.keys(diff).length > 0) {
                    /** Audit Log*/
                    const auditData = {
                        companyCode: 'AI',
                        userId: req?.user?.id ?? "Air India",
                        companyId: '',
                        eventId: 'Update',
                        eventName: '',
                        module: 'Master Data',
                        createdBy: req?.user?.id ?? "Air India",
                        createdAt: '',
                        finalStatus: 'Success',
                        finalStatusMessageText: ``,
                        oldValue: '',
                        newValue: ''
                    }

                    const currentDateTime = new Date().toISOString().replace('T', ' ').split('.')[0];
                    for (const key in diff) {
                        if (key == 'isDomestic' || key == 'isUT') {
                            originalData[key] = originalData[key] == 0 ? "false" : "true";
                            diff[key] = diff[key] == 0 ? "false" : "true";
                        }
                        auditData.oldValue = originalData[key] ?? '';
                        auditData.newValue = diff[key] ?? '';
                        auditData.ID = uuid();
                        auditData.createdAt = currentDateTime;
                        auditData.eventName = auditData.eventId + ' ' + 'Air India GSTIN Detail - ' + getDescription(key) ?? '';
                        auditData.finalStatusMessageText = 'Air India GSTIN Detail - ' + getDescription(key) + ' ' + `Updated` ?? '';

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