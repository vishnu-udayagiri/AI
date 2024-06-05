const generateNextSerialNumber = (currentSerial) => {
    //split currentSerial into alphapart and numberpart
    let alphaPart = currentSerial.substring(0, 3);
    let numberPart = currentSerial.substring(3, 6);
    let nextNumeric;
    if (numberPart < 999) {
        nextNumeric = parseInt(numberPart) + 1;
        return alphaPart + nextNumeric.toString().padStart(3, "0");
    } else {
        nextNumeric = "001";
        let charSet1 = alphaPart.charCodeAt(0);
        let charSet2 = alphaPart.charCodeAt(1);
        let charSet3 = alphaPart.charCodeAt(2);
        if (charSet3 < 90) {
            charSet3 = charSet3 + 1;
        } else {
            charSet3 = 65;
            if (charSet2 < 90) {
                charSet2 = charSet2 + 1;
            } else {
                charSet2 = 65;
                if (charSet1 < 90) {
                    charSet1 = charSet1 + 1;
                } else {
                    charSet1 = 65;
                }
            }
        }
        alphaPart = String.fromCharCode(charSet1) + String.fromCharCode(charSet2) + String.fromCharCode(charSet3);
        return alphaPart + nextNumeric;
    }

}
const generatePassword = (length = 8) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#@!&%';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
module.exports = {
    generateNextSerialNumber,
    generatePassword
}