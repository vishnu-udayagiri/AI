const fs = require('fs-extra');
const { Storage } = require('@google-cloud/storage');

const config = process.env;

const privateKeyDataString = Buffer.from(config.base64EncodedPrivateKeyData, 'base64').toString('utf-8');
const privateKeyData = JSON.parse(privateKeyDataString);
const storage = new Storage({
    projectId: config.projectId,
    credentials: {
        client_email: privateKeyData.client_email,
        private_key: privateKeyData.private_key
    }
});

const bucket = storage.bucket(config.bucket);


function getObjectDestination(fileName) {
    const [year, month] = extractYearAndMonth(fileName);
    const yearFolder = `${year}`;
    const monthFolder = `${month}`.padStart(2, '0');
    const folderPath = `${yearFolder}/${monthFolder}`;
    const destination = `${folderPath}/${fileName}`;
    return destination
}

exports.uploadFileToStorage = async (base64String, fileName) => {
    try {
        let destination = getObjectDestination(fileName);

        const buffer = Buffer.from(base64String, 'base64'); // Decode base64 string to buffer
        const file = bucket.file(destination);

        await file.save(buffer, {
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });
        return true;
    } catch (error) {
        console.log("File Uploader", `Error: ${error}`, "error");
        return false;
    }
};

exports.downloadFileAsBase64 = async (objectName) => {
    try {
        
        objectName=getObjectDestination(objectName)
        // Create a file reference
        const file = bucket.file(objectName);

        // Download the file as a buffer
        const [fileBuffer] = await file.download();

        // Convert the buffer to a base64 string
        const base64String = fileBuffer.toString('base64');

        console.log('File downloaded and converted to base64 successfully');
        return base64String;
    } catch (error) {
        console.error('Error downloading and converting file:', error);
        throw error;
    }
}

function extractYearAndMonth(fileName) {
    const year = fileName.substr(2, 2);
    const month = fileName.substr(8, 2);
    return [20 + year, month];
}
