const { createConnection } = require('./utils/db.js');
const { validateGSTIN } = require('./API-Validation/API-Validation.js');

const packetSize = process?.env?.PACKET_SIZE || 5000;

const RunGSTINValidationTask = async () => {
  
  const client = await createConnection();

  // await client.exec(`UPDATE SBR SET STATUS = 'GSTIN' WHERE GSTIN IS NULL AND STATUS = 'NEW'`);
  const data = await client.exec(`SELECT * from GSTINForValidation`);

  // filterc and form a array of all the gstins who need validation
  const gstinsForValidation = data.filter((d) => d.NEED_VALIDATION).map((d) => d.GSTIN);
  const gstinsForUpdate = data.filter((d) => !d.NEED_VALIDATION).map((d) => d.GSTIN);

  const gstinValidationCount = ( gstinsForValidation?.length ?? 0)

  console.log(`GSTINs selected for validation :: ${gstinValidationCount}`)
  console.log(`Packet size :: ${packetSize}`)

  if (gstinsForUpdate.length > 0) {
    const listOfGSTINsToupdate = `'${gstinsForUpdate.join("','")}'`;
    await client.exec(`UPDATE SBR SET STATUS = 'GSTIN' WHERE GSTIN IN (${listOfGSTINsToupdate}) and STATUS = 'NEW'`);
  }

  
  const iterations = gstinValidationCount<packetSize ? gstinValidationCount : packetSize;

  for (let i = 0; i < iterations; i++) {
    const gstin =  gstinsForValidation[i];

    const pattern = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{2}[0-9a-zA-Z]{1}$/;
    const isValidGSTIN =  pattern.test(gstin);

    if(!isValidGSTIN){
      const query1 = `UPSERT GSTIN (GSTIN,STATUS,VALIDATEDON) VALUES(
        '${gstin}' ,
        'X' ,
        CURRENT_DATE
      ) WITH PRIMARY KEY`
      try {
        await client.exec(query1);
      } catch (error) {
        console.log(error);
      }

      continue;
    }

    console.log("Validating GSTIN : " + gstin);
    let gstinData;
    try {
      gstinData = await validateGSTIN(gstin);
      console.log(gstinData);
    } catch (error) {
      console.log(error);
    }

    if (gstinData.Status != 0) {
      const query = `UPSERT GSTIN VALUES(
      ? ,
      ? ,
      ? ,
      CURRENT_DATE ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ?
    ) WITH PRIMARY KEY`;
      let address = `${gstinData.AddrBno} ${gstinData.AddrBnm} ${gstinData.AddrFlno} ${gstinData.AddrSt} ${gstinData.AddrLoc}`;
      address = address.replace(/\s\s+/g, ' ').trim();
      const dataForUpsert = [
        gstinData.Gstin,
        gstinData.StatusCode,
        gstinData.TxpType,
        gstinData.BlkStatus,
        gstinData.DtReg,
        gstinData.DtDReg,
        gstinData.LegalName,
        gstinData.TradeName,
        address,
        gstinData.AddrPncd,
        String(gstinData.StateCode).padStart(2, '0'),
      ];
      console.log("updated");
      try {
        await client.exec(query, dataForUpsert);
        await client.exec(`UPDATE SBR SET STATUS = 'GSTIN' WHERE GSTIN = '${gstinData.Gstin}' and STATUS = 'NEW'`);
      } catch (error) {
        console.log(error);
      }
    } else {
      const query1 = `UPSERT GSTIN (GSTIN,STATUS,VALIDATEDON) VALUES(
        '${gstin}' ,
        'Q1' ,
        CURRENT_DATE
      ) WITH PRIMARY KEY`
      try {
        await client.exec(query1);
      } catch (error) {
        console.log(error);
      }
      
    }
  }

  return false;

};

const RunGSTINValidationTaskForGSTIN = async (_gstin) => {
  
  const client = await createConnection();

  // filterc and form a array of all the gstins who need validation
  // const gstinsForValidation = [_gstin]


  // const gstinValidationCount = ( gstinsForValidation?.length ?? 0)

  // console.log(`GSTINs selected for validation :: ${gstinValidationCount}`)
  console.log(`Packet size :: ${packetSize}`)

  
  // const iterations = gstinValidationCount<packetSize ? gstinValidationCount : packetSize;

  // for (let i = 0; i < 1; i++) {
    
    const gstin =  _gstin;

    const pattern = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{2}[0-9a-zA-Z]{1}$/;
    const isValidGSTIN =  pattern.test(gstin);

    if(!isValidGSTIN){
      const query1 = `UPSERT GSTIN (GSTIN,STATUS,VALIDATEDON) VALUES(
        '${gstin}' ,
        'X' ,
        CURRENT_DATE
      ) WITH PRIMARY KEY`
      try {
        await client.exec(query1);
      } catch (error) {
        console.log(error);
      }

      // continue;
      return false;
    }

    console.log("Validating GSTIN : " + gstin);
    let gstinData;
    try {
      gstinData = await validateGSTIN(gstin);
      console.log(gstinData);
    } catch (error) {
      console.log(error);
    }

    if (gstinData.Status != 0) {
      const query = `UPSERT GSTIN VALUES(
      ? ,
      ? ,
      ? ,
      CURRENT_DATE ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ?
    ) WITH PRIMARY KEY`;
      let address = `${gstinData.AddrBno} ${gstinData.AddrBnm} ${gstinData.AddrFlno} ${gstinData.AddrSt} ${gstinData.AddrLoc}`;
      address = address.replace(/\s\s+/g, ' ').trim();
      const dataForUpsert = [
        gstinData.Gstin,
        gstinData.StatusCode,
        gstinData.TxpType,
        gstinData.BlkStatus,
        gstinData.DtReg,
        gstinData.DtDReg,
        gstinData.LegalName,
        gstinData.TradeName,
        address,
        gstinData.AddrPncd,
        String(gstinData.StateCode).padStart(2, '0'),
      ];
      console.log("updated");
      try {
        await client.exec(query, dataForUpsert);
        await client.exec(`UPDATE SBR SET STATUS = 'GSTIN' WHERE GSTIN = '${gstinData.Gstin}' and STATUS = 'NEW'`);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      // const query1 = `UPSERT GSTIN (GSTIN,STATUS,VALIDATEDON) VALUES(
      //   '${gstin}' ,
      //   'Q1' ,
      //   CURRENT_DATE
      // ) WITH PRIMARY KEY`
      // try {
      //   await client.exec(query1);
      //   return true;
      // } catch (error) {
      //   console.log(error);
      // }
      return false;
      
    }
  // }

  // return false;

};


const RunErrorGSTINValidationTask = async (queryErrCode,updateErrCode) => {
  
  const client = await createConnection();

  let data = []
  try {
    data = await client.exec(`SELECT GSTIN from GSTIN WHERE STATUS = '${queryErrCode}'`);
  } catch (error) {
    console.log(error);
    data = [];
  }

  const gstinsForValidation = data;

  const gstinValidationCount = ( gstinsForValidation?.length ?? 0)

  console.log(`GSTINs selected for ${queryErrCode} validation :: ${gstinValidationCount}`)
  console.log(`Packet size for ${queryErrCode} :: ${packetSize}`)


  
  const iterations = gstinValidationCount<packetSize ? gstinValidationCount : packetSize;

  for (let i = 0; i < iterations; i++) {
    const gstin =  gstinsForValidation[i]?.GSTIN??"";

    const pattern = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{2}[0-9a-zA-Z]{1}$/;
    const isValidGSTIN =  pattern.test(gstin);

    if(!isValidGSTIN){
      const query1 = `UPSERT GSTIN (GSTIN,STATUS,VALIDATEDON) VALUES(
        '${gstin}' ,
        'X' ,
        CURRENT_DATE
      ) WITH PRIMARY KEY`
      try {
        await client.exec(query1);
      } catch (error) {
        console.log(error);
      }

      continue;
    }

    console.log(`Re-Validating GSTIN with error code ${queryErrCode} :  ${gstin}`);

    let gstinData;
    try {
      gstinData = await validateGSTIN(gstin);
      console.log(gstinData);
    } catch (error) {
      console.log(error);
    }

    if (gstinData?.Status != 0) {
      const query = `UPSERT GSTIN VALUES(
      ? ,
      ? ,
      ? ,
      CURRENT_DATE ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ? ,
      ?
    ) WITH PRIMARY KEY`;
      let address = `${gstinData.AddrBno} ${gstinData.AddrBnm} ${gstinData.AddrFlno} ${gstinData.AddrSt} ${gstinData.AddrLoc}`;
      address = address.replace(/\s\s+/g, ' ').trim();
      const dataForUpsert = [
        gstinData.Gstin,
        gstinData.StatusCode,
        gstinData.TxpType,
        gstinData.BlkStatus,
        gstinData.DtReg,
        gstinData.DtDReg,
        gstinData.LegalName,
        gstinData.TradeName,
        address,
        gstinData.AddrPncd,
        String(gstinData.StateCode).padStart(2, '0'),
      ];
      console.log("updated");
      try {
        await client.exec(query, dataForUpsert);
        await client.exec(`UPDATE SBR SET STATUS = 'GSTIN' WHERE GSTIN = '${gstinData.Gstin}' and STATUS = 'NEW'`);
      } catch (error) {
        console.log(error);
      }
    } else {
      const query1 = `UPSERT GSTIN (GSTIN,STATUS,VALIDATEDON) VALUES(
        '${gstin}' ,
        '${updateErrCode}' ,
        CURRENT_DATE
      ) WITH PRIMARY KEY`
      try {
        await client.exec(query1);
      } catch (error) {
        console.log(error);
      }
      
    }
  }

  return false;

};


module.exports = {
  RunGSTINValidationTask,
  RunErrorGSTINValidationTask,
  RunGSTINValidationTaskForGSTIN
};


