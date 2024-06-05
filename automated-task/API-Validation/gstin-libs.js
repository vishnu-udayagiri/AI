const fs = require("fs");
const path = require('path');
const crypto = require("crypto");
const NodeRSA = require('node-rsa');
const axios = require("axios");
const aescrypto = require("./aes-crypto");
const {
    StageUrl,
    ClientId,
    ClientSecret,
    UserName,
    Password,
    GSTIN
} = require("./keystore/gsp.json");

const PublicKey = fs.readFileSync(path.join(__dirname, "./keystore/Exact_PublicKey/Exact_PublicKey.pem")).toString();
const IrpPublicKey = fs.readFileSync(path.join(__dirname, "./keystore/PublicKey/certificate_publickey.pem")).toString();
const rsaOptions = {
    "environment": "node",
    "encryptionScheme": "pkcs1",
    "signingScheme": "pkcs1"
};

// let _AppKey = "";
module.exports = {
    /**
     * @method ExactAuthenticate
     * @param {string} StageUrl 
     * @param {string} ClientId 
     * @param {string} ClientSecret 
     * @param {string} PublicKey 
     * @returns {object} esession 
     */

    ExactAuthenicate: async function () {

        console.log("Initiating Authentication");
        console.log("Calling Authentication API");

        try {
            const rsa = new NodeRSA(PublicKey, 'pkcs8-public-pem', rsaOptions);
            const options = {
                url: StageUrl + '/api/authentication/Authenticate',//',
                method: 'POST',
                timeout: 1000 * 20,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    ClientId: ClientId,
                    ClientSecret: rsa.encrypt(ClientSecret, "base64")
                })
            };

            const response = await axios(options);
            console.log("Response received");
        
            response["isError"] = false;

            if (response?.data?.IsAuthenticated === false) {
                response["isAuthenticated"] = false;
                console.log("Authentication process failed");
                return response;
            }

            response["isAuthenticated"] = response?.data?.IsAuthenticated?? false;
            console.log("Authentication process completed");
            return response;
            
        } catch (error) {

            console.log("Error occurred while calling Authenticaiton API.")
            console.log("Error : " + error);

            const response = {}
            response["isAuthenticated"] = false;
            return response["isError"] = true;
            
        }
        
    },

    AuthenticateIRP: async function (SubscriptionId, AuthenticationToken) {
        console.log("AuthenticateIRP call");
        var rsairp = new NodeRSA(IrpPublicKey, 'pkcs8-public-pem', rsaOptions);
        var payload = {
            "UserName": UserName,
            "Password": Password,
            "AppKey": _AppKey,
            "ForceRefreshAccessToken": false
        };
        console.log("Auth Version change v1.04" + "_046");
        var payloadBuff = Buffer.from(JSON.stringify(payload)).toString('base64');
        var options = {
            url: StageUrl + '/eivital/v1.04/auth',  //Changed by MG
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ExactSubscriptionId: SubscriptionId,
                AuthenticationToken: AuthenticationToken,
                Gstin: GSTIN
            },
            data: {
                Data: rsairp.encrypt(payloadBuff, "base64")
            }
        };


        var response = await axios(options);
        if (response.data.Status !== 1 || response.data.ErrorDetails !== null) {
            throw ("Login with IRP Failed");
        }

        response.data.Data.sekB64 = aescrypto.Decrypt(_AppKey, response.data.Data.Sek);
        return response.data;
    },

    GetGSTINData: async function (SubscriptionId, AuthenticationToken, Username, AuthToken, SekB64, gstinNumber) {

        // var options = {
        //     url: StageUrl + '/eivital/v1.04/Master?gstin=' + gstinNumber,
        //     method: 'GET',
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Gstin": GSTIN,
        //         "user_name": Username,
        //         "AuthToken": AuthToken,
        //         "ExactSubscriptionId": SubscriptionId,
        //         "AuthenticationToken": AuthenticationToken
        //     }
        // };

        var options = {

            url: StageUrl + `/commonapi/v1.3/search?action=TP&gstin=${gstinNumber}`, 
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                ExactSubscriptionId: SubscriptionId,
                AuthenticationToken: AuthenticationToken
            },
            timeout: 1000 * 20,
    
        };

        // console.log("GET GSTIN details ::", options);
        var response = await axios(options);
        if ((response?.data?.status_cd == '0' || response?.data?.status_cd == 0) && response?.data?.error != null) {
            
            const errorMessage = response?.data?.error?.message??"Unable to verify GSTIN. Please try again later.";

            return {
                Message: errorMessage,
                Status: 0
            };
        }
        try {

            // var decrypted = aescrypto.Decrypt(SekB64, response.data.Data);
            // var checkDone = JSON.parse(Buffer.from(decrypted, "base64").toString());
            const responseData = response?.data??{}
            const decrypted = Buffer.from(responseData?.data, "base64").toString('utf-8');
            var checkDone = JSON.parse(decrypted);
            /**
             * "Status" will have values as 'ACT' (Active) or 'CNL' (Cancelled) or 'INA' (Inactive) or 'PRO' (Provision). Considered active only if status='ACT'
             * The "blkStatus" indicates the status of blocking of generation of E Way Bill and will have following values
             *      i) 'U' or '' for Unblocked
             *      ii) 'B' for blocked - E Way Bill generation is not allowed for tax payers who have not filed the returns for last two months
             */

            const finalResult = {
                "Gstin": "",
                "TradeName": "",
                "LegalName": "",
                "AddrBnm": "",
                "AddrBno": "",
                "AddrFlno": "",
                "AddrSt": "",
                "AddrLoc": "",
                "StateCode": null,
                "AddrPncd": null,
                "TxpType": "",
                "Status": "",
                "BlkStatus": "",
                "DtReg": "",
                "DtDReg": "",
                "StatusCode": "" 
            }

            let address = {}

            if(checkDone?.pradr?.addr){
                address = checkDone?.pradr?.addr
            }else if(Array.isArray(checkDone?.adadr)){
                address = checkDone?.adadr[0]?.addr ?? {}
            }
            
            const isProprietorship = checkDone?.ctb == 'Proprietorship' ? true : false;

            finalResult.Gstin = checkDone?.gstin??"";
            finalResult.TradeName = checkDone?.tradeNam??"";
            finalResult.LegalName = checkDone?.lgnm??"";
            finalResult.AddrBnm = address?.bnm??"";
            finalResult.AddrBno = address?.bno??"";
            finalResult.AddrFlno = address?.flno??"";
            finalResult.AddrSt = address?.st??"";
            finalResult.AddrLoc = address?.loc??"";
            finalResult.StateCode = checkDone?.gstin?.substring(0, 2)??null;
            finalResult.AddrPncd = address?.pncd??"";
            finalResult.TxpType = getTaxpayerType(checkDone?.dty??null)
            finalResult.Status = getStatus(checkDone?.sts??'')
            finalResult.BlkStatus = checkDone?.einvoiceStatus == "Yes"?'U':'B';
            finalResult.DtReg = checkDone?.rgdt;
            finalResult.DtDReg = checkDone?.cxdt;
            finalResult.GSTResp = checkDone

            // if(finalResult.StateCode) finalResult.StateCode = Number(finalResult.StateCode)
            // if(finalResult.AddrPncd) finalResult.AddrPncd = Number(finalResult.AddrPncd)

            if(isProprietorship) finalResult.LegalName = finalResult.TradeName

            if(finalResult.DtReg != ''){

                const regDate = finalResult?.DtReg??""
                const date = regDate?.split("/")[0]??""
                const month = regDate?.split("/")[1]??""
                const year = regDate?.split('/')[2]??""

                if(date == "" || month == "" || year == ""){
                    finalResult.DtReg = null;
                }else{
                    const finalDate = `${year}-${month}-${date}`;
                    finalResult.DtReg = finalDate;
                }

            }


            if(finalResult.DtDReg != ''){

                const regDate = finalResult?.DtDReg??""
                const date = regDate?.split("/")[0]??""
                const month = regDate?.split("/")[1]??""
                const year = regDate?.split('/')[2]??""

                if(date == "" || month == "" || year == ""){
                    finalResult.DtDReg = null;
                }else{
                    const finalDate = `${year}-${month}-${date}`;
                    finalResult.DtDReg = finalDate;
                }

            }



            switch (finalResult.Status) {
                case 0:
                case "0":
                    finalResult.StatusCode = "";
                    break;
                case "ACT":
                    finalResult.StatusCode = "A";
                    break;
                case "INA":
                    finalResult.StatusCode = "I";
                    break;
                case "CNL":
                    finalResult.StatusCode = "C";
                    break;
                case "PRO":
                    finalResult.StatusCode = "P";
                    break;
                default:
                    finalResult.StatusCode = finalResult?.Status?.substring(0,1)?.toUpperCase()??"";

            }
            return finalResult;

        } catch (e) {
            console.log("API call failed: " + e.message);
            // throw (e);
        }

    },


};


function getTaxpayerType(description) {

    const sanitizedInput = (description.toLowerCase()?.replace(/[^a-z0-9]/gi, ''))??"";

    const taxpayerTypes = {
        "specialeconomiczone": "SEZ",
        "sezunit":"SEZ",
        "composition": "COM" ,
        "othernotifiedpersons":"ONP",
        "othernotifiedperson":"ONP",
        "taxdeductoratsource":"TDS",
        "taxdeductor":"TDS",
        "inputservicedistributor":"ISD",
        "inputservicedistributorisd":"ISD",
        "embassy":"EMB" ,
        "consulateorembassyofforeigncountry":"EMB",
        "regular":"REG" ,
        "specialeconomicdeveloper":"SEZ",
        "sezdeveloper":"SEZ",
        "unbody":"UNB",
        "unitednationbody":"UNB",
        "taxcollectoratsource":"TCS",
        "taxcollectorelectroniccommerceoperator":"TCS",
        "nonresidenttaxableperson":"NRP",
        "nonresidentonlineservicedistributor":"NRO",
        "casualtaxableperson":"CTP"
    };

    return taxpayerTypes[sanitizedInput]??null;

}

function getStatus(status){

    // Status" will have values as 'ACT' (Active) or 'CNL' (Cancelled) or 'INA' (Inactive) or 'PRO' (Provision).

    const sanitizedInput = (status.toLowerCase()?.replace(/[^a-z0-9]/gi, ''))??"";

    const statusDesc = {
        'active':'ACT',
        'cancelled':'CNL',
        'inactive':'INA',
        'provision':'PRO',
        'suspended':'SUS',
    }

    return statusDesc[sanitizedInput]??status;

}
