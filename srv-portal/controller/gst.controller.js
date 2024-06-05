const axios = require('axios');

function getcurrentDate() {
    // Get the current timestamp in milliseconds
    const timestamp = Date.now();

    // Create a Date object from the timestamp
    const date = new Date(timestamp);

    // Get the year, month, and day components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with '0' if necessary
    const day = String(date.getDate()).padStart(2, '0');

    // Format the date as Y-M-D
    const ymdDate = `${year}-${month}-${day}`;

    return ymdDate; // Output: "2023-10-22" (assuming the current date is October 22, 2023)

}

module.exports = async (gstin = '32AAACT8102H1ZR') => {
    let searchQuery = `SELECT *
  FROM GSTIN
  WHERE "GSTIN" = '${gstin}';`;
    let returnData = {}
    if (true) {
        const apiUrl = 'https://api.optieinvoice.com/dev/optiapi/gstindetails?gstin=' + gstin; // Replace with your API URL
        const customHeader = {
            'x-api-key': 'FUWh96wGeMH8tcbR4Wt3AQ/2LXROqbJDGPwAJ9fF', // Replace with your custom header and its value
        };

        try {
            const response = await axios.get(apiUrl, {
                headers: customHeader,
            });

            // Access the response data
            let gstinDetails = response.data.Data;
            gstinDetails.Status = gstinDetails.Status == 'ACT' ? 'A' : gstinDetails.Status;
            let query = `INSERT INTO GSTIN ("GSTIN", "STATUS", "TAXPAYERTYPE", "VALIDATEDON", "BLOCKSTATUS", "DTREG", "DTDREG")
    VALUES ('${gstinDetails.Gstin}', '${gstinDetails.Status}', '${gstinDetails.TxpType}', ${getcurrentDate()}, 'Not Blocked', '${gstinDetails.DtReg}', '${gstinDetails.DtDReg}');`
            console.log(query);

            // You can perform further processing with the response data here
        } catch (error) {
            console.error('Error:', error.message);
        }
        //Execute search query. Store result on returnData variable. 
        returnData = response.data.Data;
    }
    return returnData;
}