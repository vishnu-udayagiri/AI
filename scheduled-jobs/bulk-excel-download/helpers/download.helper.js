const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { getMaximumRowsPerFile, mergeJsonObjects, getMaximumRowsToDownload, convertStringToJSON } = require('./utils.helper');
const { getData } = require('./query.helper');


// exports.jsonToCsvAndZip = async (jsonArray, ID, fileName) => {

//   try {

//     const zip = new JSZip();

//     jsonArray.forEach(obj => {
//       const csvContent = Buffer.from(obj.FILE, 'base64').toString('utf-8');
//       zip.file(`${fileName}-${obj.SLNO}.csv`, csvContent);
//     });

//     const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

//     const tempDir = path.join(process.cwd(), 'download-temp');
//     await fs.ensureDir(tempDir);

//     const zipPath = path.join(tempDir, ID + '.zip');
//     await fs.writeFile(zipPath, zipBuffer);

//     return true;

//   } catch (error) {

//     return false;

//   }

// }

exports.jsonToCsvAndZip = async (jsonArray, ID, fileName) => {
  try {

    const tempDir = path.join(process.cwd(), 'zip-temp');
    await fs.ensureDir(tempDir);
    const zipPath = path.join(tempDir, `${ID}.zip`);
    const output = fs.createWriteStream(zipPath);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('Archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', function(err) {
      throw err;
    });

    archive.pipe(output);

    jsonArray.forEach(obj => {
      const csvContent = Buffer.from(obj.FILE, 'base64').toString('utf-8');
      archive.append(csvContent, { name: `${fileName}-${obj.SLNO}.csv` });
    });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.finalize();
    });

    return true;
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
};


exports.jsonToXlsxAndZip = async (jsonArray, ID, fileName) => {
  try {

    const tempDir = path.join(process.cwd(), 'zip-temp');
    await fs.ensureDir(tempDir);
    const zipPath = path.join(tempDir, `${ID}.zip`);
    const output = fs.createWriteStream(zipPath);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('Archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', function(err) {
      throw err;
    });

    archive.pipe(output);

    jsonArray.forEach(obj => {
      const csvContent = Buffer.from(obj.FILE, 'base64');
      archive.append(csvContent, { name: `${fileName}-${obj.SLNO}.xlsx` });
    });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.finalize();
    });

    return true;
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
};


exports.calculateDeletionTime = async (filePath) => {

  try {
      const stats = await fs.stat(filePath);
      const fileSizeBytes = stats.size;

      // Network speed assumptions
      const networkSpeedMbps = 1;
      const fileSizeMB = fileSizeBytes / (1024 * 1024); // Convert bytes to megabytes
      
      // Download time in hours
      const downloadTimeHours = fileSizeMB / (networkSpeedMbps * 60); // 1 MB per minute
      
      // Map download time to deletion time
      const minTimeHours = 1;
      const maxTimeHours = 2.5;
      let deletionTimeHours = Math.max(minTimeHours, Math.min(downloadTimeHours, maxTimeHours));

      const deletionTimeMilliseconds = deletionTimeHours * 60 * 60 * 1000;

      let deletionTimeText = `${Math.floor(deletionTimeHours)} hour${Math.floor(deletionTimeHours) !== 1 ? 's' : ''}`;
      if (deletionTimeHours > 1 && deletionTimeHours < 2) {
          deletionTimeText += " and half";
      } else if (deletionTimeHours === 2.5) {
          deletionTimeText = "2 hours and half";
      }

      return {
          time: deletionTimeMilliseconds,
          text: deletionTimeText
      };

  } catch (err) {
      console.error(err);

      // Default to minimum if there's an error
      const deletionTimeMilliseconds = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
      const deletionTimeText = '1 hour';
      return {
          time: deletionTimeMilliseconds,
          text: deletionTimeText
      };
  }
}

exports.isBulkDownloadAllowed = async(db,job) => {

  try {

    if (!db) throw new Error('DB connection is required')

    const { ID, FILTER, FILENAME, TABLENAME, EXCELCOLUMNNAME, ISMULTIPLE, FILERANGE, ORDERBY, DATEFILTERBY } = job

    const filters = convertStringToJSON(FILTER);
  
    const [totalData] = (await getData(db, TABLENAME, filters, null, null, ORDERBY, DATEFILTERBY, true)).data;
    const dataLength = Object.values(totalData)[0] ?? 0
  
  
    if (dataLength == 0) return {
      success: false,
      message:'No data available',
    };

    const maximumAllowedRows = getMaximumRowsToDownload()

    if(dataLength > maximumAllowedRows) return {
      success: false,
      message:'You are only allowed to download a maximum of ' + maximumAllowedRows + ' rows',
    }

    return {
      success: true,
      message:'You can initiate the download',
    };
    
  } catch (error) {

    return {
      success: false,
      message:'Internal server error: ' + error.message,
    }

  }
}

exports.downloadFilesFromObjectStore = async(reportType, uniqueId, localDownloadPath) => {
  try {

    const privateKeyDataString = Buffer.from(process.env.FILE_STORE_PRIVATE_KEY, 'base64').toString('utf-8');
    const privateKeyData = JSON.parse(privateKeyDataString);
    const storage = new Storage({
        projectId: process.env.FILE_STORE_PROJECT_ID,
        credentials: {
            client_email: privateKeyData.client_email,
            private_key: privateKeyData.private_key
        }
    });

    const bucket = storage.bucket(process.env.FILE_STORE_BUCKET);

    const destination = path.join('Reports',reportType, uniqueId)

    const [files] = await bucket.getFiles({ prefix: destination });

    for (const file of files) {
      const localFilePath = path.join(localDownloadPath, file.name);
      const dir = path.dirname(localFilePath);

      if (!fs.existsSync(dir)) {
        await fs.ensureDir(dir);
      }

      await new Promise((resolve, reject) => {
        const stream = file.createReadStream();
        stream.on('error', error => reject(error));
        stream.on('end', () => resolve());
        stream.pipe(fs.createWriteStream(localFilePath));
      });
    }

    return { success: true, message: 'All files downloaded successfully.' };
  } catch (error) {
    return { success: false, message: `Error downloading files: ${error.message}` };
  }
}

exports.zipFilesFromFolder = async (sourceDir,ID) => {
  try {

    const tempDir = path.join(process.cwd(), 'download-temp');
    await fs.ensureDir(tempDir);
    const zipPath = path.join(tempDir, `${ID}.zip`);
    const output = fs.createWriteStream(zipPath);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('Archiver has been finalized and the output file descriptor has closed.');
    });

    const archiveClosed = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    archive.directory(sourceDir, false);
    archive.finalize();


    await archiveClosed;

    await fs.remove(sourceDir);

    return { success: true, message: 'Directory zipped and deleted successfully.' };

  } catch (error) {
    console.error("An error occurred:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

exports.zipFilesFromFolderAndCustomDir = async (sourceDir,outputFile) => {
  try {

    const output = fs.createWriteStream(outputFile);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('Archiver has been finalized and the output file descriptor has closed.');
    });

    const archiveClosed = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    archive.directory(sourceDir, false);
    archive.finalize();


    await archiveClosed;

    await fs.remove(sourceDir);

    return { success: true, message: 'Directory zipped and deleted successfully.' };

  } catch (error) {
    console.error("An error occurred:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
};