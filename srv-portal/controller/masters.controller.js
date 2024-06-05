const masterData = {
  docTypes: [["INV", "Tax Invoice"], ["CRN", "CREDIT NOTE"], ["DBN", "DEBIT NOTE"]],
  uqc: [['BAG', 'BAGS'], ['BAL', 'BALE'], ['BDL', 'BUNDLES'], ['BKL', 'BUCKLES'], ['BOU', 'BILLION OF UNITS'], ['BOX', 'BOX'], ['BTL', 'BOTTLES'], ['BUN', 'BUNCHES'], ['CAN', 'CANS'], ['CBM', 'CUBIC METERS'], ['CCM', 'CUBIC CENTIMETERS'], ['CMS', 'CENTIMETERS'], ['CTN', 'CARTONS'], ['DOZ', 'DOZENS'], ['DRM', 'DRUMS'], ['GGK', 'GREAT GROSS'], ['GMS', 'GRAMMES'], ['GRS', 'GROSS'], ['GYD', 'GROSS YARDS'], ['KGS', 'KILOGRAMS'], ['KLR', 'KILOLITRE'], ['KME', 'KILOMETRE'], ['MLT', 'MILILITRE'], ['MTR', 'METERS'], ['MTS', 'METRIC TON'], ['NOS', 'NUMBERS'], ['PAC', 'PACKS'], ['PCS', 'PIECES'], ['PRS', 'PAIRS'], ['QTL', 'QUINTAL'], ['ROL', 'ROLLS'], ['SET', 'SETS'], ['SQF', 'SQUARE FEET'], ['SQM', 'SQUARE METERS'], ['SQY', 'SQUARE YARDS'], ['TBS', 'TABLETS'], ['TGM', 'TEN GROSS'], ['THD', 'THOUSANDS'], ['TON', 'TONNES'], ['TUB', 'TUBES'], ['UGS', 'US GALLONS'], ['UNT', 'UNITS'], ['YDS', 'YARDS'], ['OTH', 'OTHERS']],
  rcpa: ['Y', 'N'],
  isService: [["N", "No"], ["Y", "Yes"]],
  gstrate: [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28],
  posstate: [['01', 'Jammu & Kashmir'], ['02', 'Himachal Pradesh'], ['03', 'Punjab'], ['04', 'Chandigarh'], ['05', 'Uttarakhand'], ['06', 'Haryana'], ['07', 'Delhi'], ['08', 'Rajasthan'], ['09', 'Uttar Pradesh'], ['10', 'Bihar'], ['11', 'Sikkim'], ['12', 'Arunachal Pradesh'], ['13', 'Nagaland'], ['14', 'Manipur'], ['15', 'Mizoram'], ['16', 'Tripura'], ['17', 'Meghalaya'], ['18', 'Assam'], ['19', 'West Bengal'], ['20', 'Jharkhand'], ['21', 'Odisha'], ['22', 'Chhattisgarh'], ['23', 'Madhya Pradesh'], ['24', 'Gujarat'], ['25', 'Daman & Diu'], ['26', 'Dadra & Nagar Haveli'], ['27', 'Maharashtra'], ['29', 'Karnataka'], ['30', 'Goa'], ['31', 'Lakshdweep'], ['32', 'Kerala'], ['33', 'Tamil Nadu'], ['34', 'Puducherry'], ['35', 'Andaman & Nicobar Islands'], ['36', 'Telangana'], ['37', 'Andhra Pradesh'], ['38', 'Ladakh'], ['96', 'Other Territory'], ['96', 'Other Countries']],
  invoicetype: [['Reg', 'Regular'], ['SEZP', 'SEZ supplies with payment'], ['SEZWP', 'SEZ supplies without payment'], ['EXP', 'Export with payment'], ['EXPWP', 'Export without payment'], ['SBWH', 'Sale from Bonded WH'], ['DEXP', 'Deemed Exp'], ['WOPAY', 'Without payment'], ['WPAY', 'With payment']],
  supplytype: ['Inter State', 'Intra State'],
  differentialpct: [65],
  subsupplytype: ['Supply', 'Import', 'Export', 'Job Work', 'For Own Use', 'Job Work Return', 'Sales Return', 'Others', 'SKD/CKD/Lots', 'Line Sales', 'Recipients Not Known', 'Exhibition or Fairs'],
  paymode: ['Cash', 'Credit'],
  supplytype: ['Outward', 'Inward'],
  transactionmode: ['Regular ', 'BillToShopTo', 'BillFromDispatchFrom ', 'CombinationOf2_3'],
  documenttype: ['Invoice', 'Bill', 'BillOfEntry', 'Challan', 'CreditNote', 'Others'],
  taxon: ['On-Quantity', 'On-Gross amount', 'Taxable amount', 'Lumpsum']
};


module.exports = {
  getCode(item, label) {
    const d = masterData[item];
    const f = d.filter((v, i) => {
      return v[1] === label;
    });
    return (f) ? f[0][0] : null;
  },
  getLabel(item, code) {
    const d = masterData[item];
    const f = d.filter((v, i) => {
      return v[0] === code;
    });
    return (f) ? f[0][1] : null;
  },
  isExist(item, value) {
    const d = masterData[item];
    const f = d.filter((v, i) => {
      let rv;
      if (typeof v === 'object') {
        rv = (v[0] === value || v[1] === value);
      } else {
        rv = (v === value);
      }
      return rv;
    });
    return (f.length > 0);
  },
  getStateCodeFromStateName(stateName) {
    //Lowecase conversion of LHS for uniform search
    stateName = stateName.toUpperCase();
    let stateNames=JSON.parse(JSON.stringify(masterData.posstate));
    for (var i = 0; i < masterData.posstate.length; i++) {
      let stateCodeValue = stateNames[i];
      // Lowecase conversion of RHS for uniform search
      stateCodeValue[1] = stateCodeValue[1].toUpperCase();
      if (stateCodeValue[1] == stateName)
        return stateCodeValue[0];

      //COnflit of '&' symbol with 'AND'
      else if (stateCodeValue[1].includes('&')) {
        stateCodeValue[1] = stateCodeValue[1].replace(/&/g, 'and');
        if (stateCodeValue[1] == stateName)
          return stateCodeValue[0];
      }

    }
    return stateName;
  },
  getStateNameByCode(code) {
    let posstate=masterData.posstate;
    // Loop through the array to find the matching state name
    for (var i = 0; i < posstate.length; i++) {
      if (posstate[i][0].toLowerCase() === code) {
        return posstate[i][1];
      }
    }
  
    // Return null if no matching code is found
    return null;
  },
  getStandardName(fieldName, masterType) {
    const standardTypes = {
      Typ: 'docTypes',
      Unit: 'uqc',
      IsServc: 'isService'
    }
    fieldName = fieldName.toUpperCase();
    for (const docType of masterData[standardTypes[masterType]]) {
      // UpperCase conversion of RHS for uniform search
      let docTypeUpperCase = docType.map(name => name.toUpperCase());
      if (docTypeUpperCase.includes(fieldName))
        return docType[0];

    }

  }
};
