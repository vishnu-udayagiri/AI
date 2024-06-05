const { ExactAuthenicate, AuthenticateIRP, GetGSTINData, gstinSearchByPAN } = require('./gstin-libs');
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');
const tokenDetailsFilePath = path.join( process.cwd(), 'TokenDetails.json');


// let AuthToken = '';
let SubscriptionId = '';
let TokenExpiry = '';
// let AuthToken2 = '';
// let Username = '';
// let SekB64 = '';

const doAuthentication = async () => { 

  const authData = await ExactAuthenicate();
  const isError = authData?.isError??false;
  const isAuthenticated = authData?.isAuthenticated??false;
  const SubscriptionId = authData?.data?.AuthorizedSubscriptions[0]?.SubscriptionId?? null;
  const AuthToken = authData?.data?.AuthenticationToken??null;
  const TokenExpiry = authData?.data?.AuthenticationValidTillDateTime??null;

  return {
    isError,
    isAuthenticated,
    SubscriptionId,
    AuthToken,
    TokenExpiry
  }

};

const validateGSTIN = async (gstin) => {
  // if (AuthToken2 == '' || moment.utc(TokenExpiry,"YYYY-MM-DD HH:mm:ss").isBefore(moment.utc())) {
  //   await doAuthentication();
  // }

  const {success,message,tokenDetails} = await doAuthenticateAndRefresh()

  if(!success) return {Status : 0}

  const {authToken,subscriptionId} = tokenDetails


  const gstinDetails = await GetGSTINData(subscriptionId, authToken, '', '', '', gstin);
  return gstinDetails;
};

module.exports = {
  validateGSTIN
};

async function doAuthenticateAndRefresh(){

  try {

    const tokenDetails = getAuthToken();
    if(tokenDetails.success){

      const details = tokenDetails.tokenDetails;
      const _expiryDate = details.expiry;

      if(_expiryDate){
        const expiryDate = new Date(_expiryDate)
        const currentTime = new Date()

        if(currentTime > expiryDate ){
          const result = await getAndSaveAuthentication();
          return result;
        }
        else{
          return tokenDetails;
        }

      }

      const result = await getAndSaveAuthentication();
      return result;

    }

    const result = await getAndSaveAuthentication();
    return result;
    
  } catch (error) {

    console.log('Error authenticating API');
    console.log("Error: " + error);

    return {
      success: false,
      message: "Error in authenticating",
      tokenDetails:{
        subscriptionId:null,
        authToken: null,
        expiry: null,
      }
    }


    
  }

}

function saveAuthToken (authToken,expiry,subscriptionId) {
  
  fs.ensureFileSync(tokenDetailsFilePath);
  
  const data = {
    authToken,
    expiry,
    subscriptionId
  }
  
  try {
    fs.writeJSONSync(tokenDetailsFilePath,data);

    return{
      success:true,
      message:"Token details saved successfully"
    }

  } catch (error) {
    console.log("Error saving token details");
    console.log("Error :"+error);
    
    const isFileExists = fs.existsSync(tokenDetailsFilePath);
    if(isFileExists){
      fs.unlinkSync(tokenDetailsFilePath);
    }

    return{
      success:false,
      message:"Failed to save token details"
    }

  }
      
}

function getAuthToken () {
  
  fs.ensureFileSync(tokenDetailsFilePath);
    
  try {

    const data = fs.readJSONSync(tokenDetailsFilePath);

    const tokenDetails = {
      authToken: data?.authToken??null,
      expiry: data?.expiry??null,
      subscriptionId:data?.subscriptionId??null,
    }

    return{
      success:true,
      message:"Token details retrieved successfully",
      tokenDetails,
    }

  } catch (error) {
    console.log("Error retrieving token details");
    console.log("Error :"+error);
    
    const isFileExists = fs.existsSync(tokenDetailsFilePath);
    if(isFileExists){
      fs.unlinkSync(tokenDetailsFilePath);
    }

    const tokenDetails = {
      authToken: null,
      expiry: null,
      subscriptionId:null,
    }

    return{
      success:false,
      message:"Failed to retrieve token details",
      tokenDetails,
    }

  }
      
}

async function getAndSaveAuthentication() {

  const {isError,isAuthenticated,AuthToken,TokenExpiry,SubscriptionId} = await doAuthentication();

  if(isError) {
    return {
      success:false,
      message:"Error authenticating GSTIN validation API.", 
      tokenDetails:{
        subscriptionId:null,
        authToken: null,
        expiry: null,
      }
    }
  }

  if(!isAuthenticated) {
    return {
      success:false, 
      message:"Authentication failed.", 
      tokenDetails:{
        subscriptionId: null,
        authToken: null,
        expiry: null,
      }
    }
  }

  saveAuthToken(AuthToken,TokenExpiry,SubscriptionId)

  return {
    success:true, 
    message:"Authentication successful.",  
    tokenDetails:{
      subscriptionId:SubscriptionId,
      authToken: AuthToken,
      expiry: TokenExpiry,
    }
  }
}
