"use strict";

const chromium = require("chrome-aws-lambda");

var fs = require("fs");

module.exports = async function (htmlString) {
  let browser = null;

  let searchFooter = htmlString.match(/<footer[\s\S]*<\/footer>/gm);
  htmlString = htmlString.replace(/<footer[\s\S]*<\/footer>/gm, '');
  htmlString=htmlString.replace(/@page\s*{([^}]*)}/gm,'');
  htmlString=htmlString.replace(/.page-footer,.page-footer-space\s*{([^}]*)}/gm,'');
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });
    //console.log(RequestBody.PdfPath);
    const page = await browser.newPage();
    await page.setContent(htmlString);
    //await page.emulateMedia('screen');
    //-------------------------------------------
    console.log("page.pdf before start");
    let pdf;
    if (searchFooter != null) {
      searchFooter = searchFooter[0].replace(/footer/gm, 'div');
      console.log(searchFooter);
      pdf = await page.pdf({
        format: "A4",
        displayHeaderFooter: true,
        printBackground: true,
        footerTemplate: searchFooter,
        margin: { top: "2cm", right: "1cm", bottom: "3cm", left: "1cm" }
      });
    }
    else {
      pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
      });
    }
    console.log("HELLO", pdf);
    return pdf;
  } catch (error) {
    return error;
  } 
};
