const axios = require('axios');

async function fireRequests(datas, url) {
    const requests = datas.map(data => axios.post(url, data));
    const responses = await Promise.all(requests);
    return responses.map(response => response.data);
}


function divideArrayIntoSubarrays(array, n) {
    const subarraySize = Math.ceil(array.length / n); // Calculate size of each subarray
    const subarrays = [];

    for (let i = 0; i < array.length; i += subarraySize) {
        const subarray = array.slice(i, i + subarraySize); // Slice the original array into subarray
        subarrays.push(subarray);
    }

    return subarrays;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (records, url, concurrentLambdas = 900) => {
    
    console.time(`PDFs of  ${records.length} records completed in`);
    //Turn incoming Data into required format
    records=records.map(record=>({HtmlString:Buffer.from(record).toString('base64')}))
    

    let pdfs = [];

    //Create appropriate sub arrays
    let n = (records.length / concurrentLambdas) + 1;
    const subarrayRecords = divideArrayIntoSubarrays(records, n);

    //Create PDF
    for (let i = 0; i < subarrayRecords.length; i++) {
        const recordSet = subarrayRecords[i];
        pdfs = pdfs.concat(await fireRequests(recordSet, url));
    
        // Check if it's the last iteration
        if (i !== subarrayRecords.length - 1) {
            await sleep(30000); // Sleep for 30 seconds for all iterations except the last one
        }
    }
    console.timeEnd(`PDFs of  ${records.length} records completed in`);
    return pdfs;
}