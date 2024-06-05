const svgCaptcha = require('svg-captcha');

/**
 * Description
 * @param {Number} length=6
 * @returns {Object} {text:string, data:string,}
 *  - text - Generated captcha text
 *  - data - Generated captcha svg image data (string)
 */
exports.generateCaptcha = (length=6) =>{

    const captcha = svgCaptcha.create({
        size:length,
        ignoreChars:'0o1i',
        noise: 2,
    });

    const base64Data = Buffer.from(captcha.data).toString('base64');

    return {
        text: captcha.text,
        data: `data:image/svg+xml;base64,${base64Data}`
    };

}

/**
 * Description
 * Validate captcha
 * @param {Object} session - Express session
 * @param {string} captchaInput - Text input from the request body
 * @returns {Object} Contains two fields - Success = True|False and Message = String
 */
exports.validateCaptcha = (session, captchaInput) =>{

    const captcha = session?.captcha || ""

    if(!session) return{success:false,message:'Server error'}
    if(!captcha) return{success:false,message:'Please refresh the page and try again'}
    if(!captchaInput) return{success:false,message:'Captcha input cannot be empty'}

    if(!captcha || !captchaInput) return{success:false,message:'Failed to validate captcha'}
    if(captcha === captchaInput) return {success:true,message:'Captcha verified successfully'}
    else return {success:false,message:'Captcha not matching'}

}