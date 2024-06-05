const axios = require('axios');
const { isValidGSTIN } = require("../helpers/common.helper")

exports.validateGSTIN = async (tx, gstin) => {

    let isCorrectGSTIN = isValidGSTIN(gstin);

    if(!isCorrectGSTIN){
        return {
            status:'Failed',
            message:'Invalid GSTIN format',
        }
    }

    return await checkGSTINStatus(tx, gstin)

}

exports.getGSTINDetails = async (tx, gstin) => {

    try {

        if(!gstin){
            return {
                status:'Failed',
                message:'GSTIN is required',
                legalName:'',
                address:'',
                postalCode:'',
                stateCode:'',
            }
        }
    
        const query = "SELECT * FROM GSTIN WHERE GSTIN = ?"
        const data = (await tx.run(query,[gstin]))[0]
    
        if(data) 
        return {
            status : 'Success',
            message : 'Valid GSTIN',
            legalName: data?.LEGALNAME,
            address:data?.ADDRESS,
            postalCode:data?.POSTALCODE,
            stateCode:data?.STATECODE,
        }

        return {
            status : 'Failed',
            message : 'Details not found',
            legalName:'',
            address:'',
            postalCode:'',
            stateCode:'',
        }
    
        
    } catch (error) {
        console.log(error);
        return {
            status : 'Failed',
            message : 'GSTIN details not found',
            legalName:'',
            address:'',
            postalCode:'',
            stateCode:'',
        } 
    }

   

}

async function checkGSTINStatus(tx, gstin) {

    try {

        if(!gstin){
            return {
                status:'Failed',
                message:'GSTIN is required',
            }
        }
    
        const query = "SELECT * FROM GSTIN WHERE GSTIN = ? AND STATUS = 'A' AND VALIDATEDON >= ADD_DAYS(CURRENT_DATE, -30)"
        const data = (await tx.run(query,[gstin]))[0]
    
        if(data) return {
            status : 'Success',
            message : 'Valid GSTIN',
        }
    
        const gstinDetails = await getGstinDetailsAndUpdate(tx,gstin)
    
        if(gstinDetails == 'A'){
            return {
                status : 'Success',
                message : 'Valid GSTIN',
            }
        }else if(gstinDetails == 'APIERR'){
            return {
                status : 'Failed',
                message : 'API Call Failed',
            }
        }else if(gstinDetails == 'PGMERR'){
            return {
                status : 'Failed',
                message : 'Internal Error',
            }
        }else{
            return {
                status : 'Failed',
                message : 'Invalid GSTIN',
            } 
        }
        
    } catch (error) {
        console.log(error);
        return {
            status : 'Failed',
            message : 'GSTIN Validation failed',
        } 
    }

   

}


async function getGstinDetailsAndUpdate(tx,gstin) {
    try {

        let url = process.env.TaskRunnerAPI

        if(url?.endsWith("/")) url = url.slice(0,-1)

        const response = await axios.get(`${url}/validate?gstin=${gstin}`);

        if (response && response.data) {
            const gstinDetails = response?.data
            const gstinStatus = gstinDetails?.StatusCode ?? ""

            if(gstinStatus == 'A'){
                const query = 'SELECT * FROM GSTIN WHERE GSTIN = ?'
                const data =( await tx.run(query,[gstin]))[0];

                const {
                    Gstin,
                    TradeName,
                    LegalName,
                    AddrBnm,
                    AddrBno,
                    AddrFlno,
                    AddrSt,
                    AddrLoc,
                    StateCode,
                    AddrPncd,
                    TxpType,
                    BlkStatus,
                    DtReg,
                    DtDReg  
                } = gstinDetails

                if(data){
                    const query = 'UPDATE GSTIN SET STATUS = ? WHERE GSTIN = ?'
                    const data = (await tx.run(query,['A',gstin]));
                }else{

                    const addressArray = [                    
                        AddrBnm,
                        AddrBno,
                        AddrFlno,
                        AddrSt,
                        AddrLoc
                    ]

                    const cleanAddress = addressArray.filter(item => item).join(" ");
                    const updateDate = new Date().toISOString().split('T')[0]

                    const query = "INSERT INTO GSTIN (GSTIN,STATUS,TAXPAYERTYPE,VALIDATEDON,BLOCKSTATUS,DTREG,DTDREG,LEGALNAME,TRADENAME,ADDRESS,POSTALCODE,STATECODE) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
                    const data = await tx.run(query,[Gstin,gstinStatus,TxpType,updateDate,BlkStatus,DtReg,DtDReg,LegalName,TradeName,cleanAddress,AddrPncd,StateCode])

                }
            }

            return gstinStatus || "APIERR";
        } else {
            return "APIERR";
        }
    } catch (error) {
        console.error('Error occurred:', error);
        return "PGMERR";
    }
}