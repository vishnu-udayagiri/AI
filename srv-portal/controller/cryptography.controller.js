const crypto=require('crypto');

const key='B488B41A9BF1C609D20176A217CE5B89';
const iv='8E12399C07726F5A';

exports.decryptAesNode = async (encryptedText) => {
    var keyBase64 = Buffer.from(key, 'hex').toString('base64');
    var encrypted = Buffer.from(encryptedText, 'base64');
    return await nodeDecryptAes(encrypted, keyBase64);
}
exports.encryptAesNode = async (JsonText) => {
    var keyBase64 = Buffer.from(key, 'hex');
    var iv16 = Buffer.from(iv + iv, 'hex');
    return await nodeEncryptionAes(JsonText, keyBase64, iv16);
}
async function nodeDecryptAes(encrypted, keyBase64) {
    try {
        var key = Buffer.from(keyBase64, "base64");
        const iv = encrypted.slice(0, 16);
        console.log("*** Dec ******** %d ****", key.length);
        console.log("*** Dec iv ******** %d ****", iv.length);
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv); //'aes-128-cbc'
        decipher.setAutoPadding(false);
        encrypted = encrypted.slice(16);
        var decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        var padlen = decrypted[decrypted.length - 1];
        return decrypted.slice(0, decrypted.length - padlen).toString();
    } catch (Exception) {
        if (Exception.reason == undefined) {
            return {
                message: "Invalid Key detected"
            };
        } else {
            return {
                message: "Corrupted Data"
            };
        }
    }
}
 
 
async function nodeEncryptionAes(JsonText, keyBase64, iv16) {
    try {
        console.log("*** Dec ******** %d ****", keyBase64.length);
        console.log("*** Dec iv ******** %d ****", iv16.length);
        const textBuffer = Buffer.from(JSON.stringify(JsonText));
        var encoded = Buffer.concat([iv16, textBuffer]);
        const cipher = crypto.createCipheriv('aes-128-cbc', keyBase64, iv16); //"aes-128-cbc"
        let encrypted = cipher.update(encoded, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (Exception) {
        if (Exception.reason == undefined) {
            return {
                message: "Invalid Key"
            };
        } else {
            return {
                message: "Corrupted Data"
            };
        }
    }
}