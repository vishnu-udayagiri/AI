const archiver = require('archiver');
module.exports = {
  zipPdfFiles: (inputFiles) => {
    return new Promise((resolve, reject) => {
      try {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const chunks = [];

        // Listen for all archive data to be written
        archive.on("data", (chunk) => {
          chunks.push(chunk);
        });

        // Once the archive is finalized, resolve with the Base64-encoded string
        archive.on("end", () => {
          const result = Buffer.concat(chunks).toString("base64");
          resolve(result);
        });

        // Handle errors
        archive.on("error", (err) => {
          reject(err);
        });

        // Iterate through input PDF files
        for (const inputFile of inputFiles) {
          const pdfBuffer = Buffer.from(inputFile.FILE, "base64");

          // Get the base name of the file without the extension
          const fileName = inputFile.FILENAME;

          // Append the PDF file to the archive with a specific name
          archive.append(pdfBuffer, { name: `${fileName}.pdf` });
        }

        // Finalize the archive
        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  },
};
