const moment = require('moment');

module.exports = cds.service.impl(async function (req) {

    this.on("getDashboardDetails", async (req) => {
        const tx = cds.transaction(req);
        // const supplierGSTIN = req.data.supplierGSTIN;
        // const financialYear = req.data.financialYear;

        const { supplierGSTIN,
            financialYear,
            documentType,
            sectionType,
            quarter,
            year,
            from,
            to } = req.data;
        try {

            const conditions = [];

            /**Supplier GSTIN Filter */
            if (supplierGSTIN.length > 0) {
                conditions.push(`SUPPLIERGSTIN IN (${supplierGSTIN.map(obj => `'${obj.value}'`)})`);
            }

            /**Financial Year Filter */
            if (Object.keys(financialYear).length > 0) {
                const financialYearDate = getMonthYearDates(financialYear);
                const start = moment(financialYearDate.start).format("YYYY-MM-DD");
                const end = moment(financialYearDate.end).format("YYYY-MM-DD");
                conditions.push(`INVOICEDATE BETWEEN CAST('${start}' AS DATE) AND CAST('${end}' AS DATE)`);
            }

            /**Document Type Filter */
            if (documentType.length > 0) {
                conditions.push(`DOCUMENTTYPE IN (${documentType.map(obj => `'${obj.value}'`)})`);
            }

            /**Section Type Filter */
            if (sectionType.length > 0) {
                conditions.push(`SECTIONTYPE IN (${sectionType.map(obj => `'${obj.value}'`)})`);
            }

            /**Quarter Filter */
            if (quarter.length > 0 && year) {
                const dates = getQuarterDates(quarter, year);
                for (const [startDate, endDate] of dates) {
                    const start = moment(startDate).format("YYYY-MM-DD");
                    const end = moment(endDate).format("YYYY-MM-DD");
                    conditions.push(`INVOICEDATE BETWEEN CAST('${start}' AS DATE) AND CAST('${end}' AS DATE)`);
                }
            }

            /**Date Range Filter */
            if (from && to) {
                const start = moment(from).format("YYYY-MM-DD");
                const end = moment(to).format("YYYY-MM-DD");
                conditions.push(`INVOICEDATE BETWEEN CAST('${start}' AS DATE) AND CAST('${end}' AS DATE)`);
            }

            const condition = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const ifInvoice = await tx.run(`SELECT TOP 1 ID FROM "INVOICE" ${condition}`);

            var taxWiseLiabiity = [],
                sectionWiseLiabiity = [],
                stateWiseLiabiity = [], regionWiseLiability = [], salesWiseBreakUp = [], taxRateWiseBreakUp = [], trendData = [];
            if (ifInvoice.length > 0) {
                /** Tax Wise Liability */
                taxWiseLiabiity = await tx.run(`SELECT 'CGST' AS "TaxType",
                                                    SUM(COLLECTEDCGST) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                LEFT OUTER JOIN
                                                    "INVOICE"
                                                ON ID = INVOICE_ID ${condition}
                                                
                                                UNION ALL
                                                
                                                SELECT 'SGST' AS "TaxType",
                                                    SUM(COLLECTEDSGST) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                LEFT OUTER JOIN
                                                    "INVOICE"
                                                ON ID = INVOICE_ID ${condition}
                                                
                                                UNION ALL
                                                
                                                SELECT 'IGST' AS "TaxType",
                                                    SUM(COLLECTEDIGST) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                LEFT OUTER JOIN
                                                    "INVOICE"
                                                ON ID = INVOICE_ID ${condition}
                                                
                                                UNION ALL
                                                
                                                SELECT 'UTGST' AS "TaxType",
                                                    SUM(COLLECTEDUTGST) AS "TaxAmount"
                                                FROM 
                                                    "INVOICEITEMS"
                                                LEFT OUTER JOIN
                                                    "INVOICE"
                                                ON ID = INVOICE_ID ${condition}`
                );

                const sectionCondition = (condition ? condition + ' AND' : 'WHERE') + ' SECTIONTYPE is not null'
                /** Section Wise Liability */
                sectionWiseLiabiity = await tx.run(`SELECT
                                                            SECTIONTYPE as "sectionType",
                                                            SUM(COLLECTEDINVOICEVALUE) as "totalInvoiceValue"
                                                    FROM 
                                                        "INVOICE"
                                                    INNER JOIN 
                                                        "INVOICEITEMS" ON INVOICE_ID = ID
                                                        ${sectionCondition}
                                                    GROUP BY 
                                                        SECTIONTYPE`
                );

                const stateCondition = (condition ? condition + ' AND' : 'WHERE') + ' REGION is not null'
                /** State Wise Liability */
                stateWiseLiabiity = await tx.run(`SELECT
                                                        sc.STATENAME AS "state",
                                                        SUM(COLLECTEDINVOICEVALUE) AS "totalInvoiceValue",
                                                        sc.STATECODE AS "stateCode",
                                                        sc.REGION AS "region"
                                                    FROM 
                                                        "INVOICE" 
                                                    INNER JOIN 
                                                        "INVOICEITEMS" 
                                                    ON 
                                                        INVOICE_ID = ID
                                                    INNER JOIN 
                                                        "STATECODES" AS sc 
                                                    ON 
                                                        LEFT(SUPPLIERGSTIN, 2) = sc.STATECODE ${stateCondition}
                                                    GROUP BY 
                                                        sc.STATENAME, 
                                                        sc.STATECODE,
                                                        sc.REGION;`
                );

                regionWiseLiability = stateWiseLiabiity.reduce((acc, entry) => {
                    const region = entry.region;
                    const amount = parseFloat(entry.totalInvoiceValue);

                    const regionEntry = acc.find((item) => item.region === region);

                    if (regionEntry) {
                        regionEntry.amount += amount;
                        regionEntry.state.push({ state: entry.state, amount });
                    } else {
                        acc.push({ region, amount, state: [{ state: entry.state, amount }] });
                    }

                    return acc;
                }, []);

                const internationalCondition = (condition ? condition + ' AND' : 'WHERE') + ` ROUTINGTYPE = 'I'`
                const excemptedCondition = (condition ? condition + ' AND' : 'WHERE') + ` EXEMPTEDZONE = '1'`
                const GSTApplicableCondition = (condition ? condition + ' AND' : 'WHERE') + ` ROUTINGTYPE = 'D'`

                /** Sales wise break up International/ Exempt/ GST Applicable Revenue */
                salesWiseBreakUp = await tx.run(`SELECT 
                                                    'International' AS "type",
                                                    SUM(COLLECTEDINVOICEVALUE) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${internationalCondition}
                                                
                                                UNION ALL
                                                
                                                SELECT 
                                                    'Exempt' AS "type",
                                                    SUM(COLLECTEDINVOICEVALUE) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${excemptedCondition}
                                                
                                                UNION ALL
                                                
                                                SELECT 
                                                    'GST Applicable Revenue' AS "type",
                                                    SUM(COLLECTEDINVOICEVALUE) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${GSTApplicableCondition}`);

                const taxRate5 = (condition ? condition + ' AND' : 'WHERE') + ` (CGSTRATE + SGSTRATE + IGSTRATE + UTGSTRATE) = 5`
                const taxRte12 = (condition ? condition + ' AND' : 'WHERE') + ` (CGSTRATE + SGSTRATE + IGSTRATE + UTGSTRATE) = 12`
                const taxRate0 = (condition ? condition + ' AND' : 'WHERE') + ` (CGSTRATE + SGSTRATE + IGSTRATE + UTGSTRATE) = 0`
                const taxRte18 = (condition ? condition + ' AND' : 'WHERE') + ` (CGSTRATE + SGSTRATE + IGSTRATE + UTGSTRATE) = 18`

                /**Tax Rate Wise BreakUp */
                taxRateWiseBreakUp = await tx.run(`SELECT 
                                                    '5%' AS "taxRate",
                                                    COALESCE(SUM(COLLECTEDINVOICEVALUE), 0) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${taxRate5}
                                                
                                                UNION ALL
                                                
                                                SELECT 
                                                    '12%' AS "taxRate",
                                                    COALESCE(SUM(COLLECTEDINVOICEVALUE), 0) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${taxRte12}
                                                
                                                UNION ALL
                                                
                                                SELECT 
                                                    '0%' AS "taxRate",
                                                    COALESCE(SUM(COLLECTEDINVOICEVALUE), 0) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${taxRate0}
                                                
                                                UNION ALL
                                                
                                                SELECT 
                                                    '18%' AS "taxRate",
                                                    COALESCE(SUM(COLLECTEDINVOICEVALUE), 0) AS "totalInvoiceValue"
                                                FROM 
                                                    "INVOICEITEMS"
                                                    LEFT OUTER JOIN
                                                    "INVOICE"
                                                    ON INVOICE_ID = ID ${taxRte18}`);

                trendData = await tx.run(`SELECT 
                                            SUM(INVOICEITEMS.COLLECTEDINVOICEVALUE) AS Total,
                                            INVOICEDATE AS TrendLabel
                                        FROM 
                                            INVOICEITEMS
                                            LEFT OUTER JOIN
                                            INVOICE
                                            ON INVOICEITEMS.INVOICE_ID = INVOICE.ID
                                        GROUP BY INVOICEDATE
                                        ORDER BY INVOICEDATE ASC`);
            }
            const response = {
                taxWiseLiabiity: taxWiseLiabiity,
                sectionWiseLiabiity: sectionWiseLiabiity,
                stateWiseLiabiity: regionWiseLiability,
                salesWiseBreakUp: salesWiseBreakUp,
                taxRateWiseBreakUp: taxRateWiseBreakUp,
                trendData: trendData
            }

            return JSON.stringify(response);

        } catch (error) {
            return {
                status: 500,
                msg: "Error in fetching Data"
            }
        }
    });

    this.on("getTrendDetails", async (req) => {
        console.log(req.data, "Req data");
    
        const year = req.data.year;
        console.log(year, "Processing year");
    
        if (year !== '3Y' && year !== '5Y') {
            console.error("Invalid trend period specified:", year);
            
        }
    
        const tx = cds.transaction(req);
    
        try {
            let query = '';
            if (year === '3Y') {
                console.log("Processing 3Y trend");
                query = `
                    DO BEGIN
                        DECLARE min_year INT;
                        SELECT YEAR(MIN(invoicedate)) INTO min_year FROM INVOICE;
                        
                        SELECT 
                          
                            SUM(II.COLLECTEDINVOICEVALUE) AS Total,
                            TO_NVARCHAR(CAST(FLOOR((YEAR(I.invoicedate) - min_year) / 3) * 3 + min_year AS INTEGER)) || '-' || 
                            TO_NVARCHAR(CAST(FLOOR((YEAR(I.invoicedate) - min_year) / 3) * 3 + 2 + min_year AS INTEGER)) AS TrendLabel
                        FROM 
                            INVOICEITEMS II
                            LEFT OUTER JOIN INVOICE I ON II.INVOICE_ID = I.ID
                        WHERE
                            I.invoicedate IS NOT NULL
                        GROUP BY 
                            FLOOR((YEAR(I.invoicedate) - min_year) / 3)
                        ORDER BY 
                            TrendLabel;
                    END;
                `;
            } else if (year === '5Y') {
                console.log("Processing 5Y trend");
                query = `
                    DO BEGIN
                        DECLARE min_year INT;
                        SELECT YEAR(MIN(invoicedate)) INTO min_year FROM INVOICE;
                        
                        SELECT 
                          
                            SUM(II.COLLECTEDINVOICEVALUE) AS Total,
                            TO_NVARCHAR(CAST(FLOOR((YEAR(I.invoicedate) - min_year) / 5) * 5 + min_year AS INTEGER)) || '-' || 
                            TO_NVARCHAR(CAST(FLOOR((YEAR(I.invoicedate) - min_year) / 5) * 5 + 4 + min_year AS INTEGER)) AS TrendLabel
                        FROM 
                            INVOICEITEMS II
                            LEFT OUTER JOIN INVOICE I ON II.INVOICE_ID = I.ID
                        WHERE
                            I.invoicedate IS NOT NULL
                        GROUP BY 
                            FLOOR((YEAR(I.invoicedate) - min_year) / 5)
                        ORDER BY 
                            TrendLabel;
                    END;
                `;
            }
    
            const trendDataYear = await tx.run(query);
            console.log("Query Result:", trendDataYear);
    
          
            const response = {
                trend: year,
                trendData: trendDataYear
            };
    
            
            return JSON.stringify(response);
        } catch (error) {
            console.error("Error processing trend details:", error);
            return { status: 500, msg: "Error in processing trend details" };
        }
    });
    

    
});

function getMonthYearDates(inputYearMonth) {
    const [year, month] = inputYearMonth.split('-').map(Number);
    // Start date is the first day of the specified month and year
    const fromDate = new Date(year, month - 1, 1);

    // End date is the last day of the specified month and year
    const lastDayOfMonth = new Date(year, month, 0);
    const toDate = new Date(year, month - 1, lastDayOfMonth.getDate());


    return { start: fromDate, end: toDate };
}

function getQuarterDates(quarters, year) {
    const quarterStarts = { "Q1": 1, "Q2": 4, "Q3": 7, "Q4": 10 };
    const results = [];

    for (let quarter of quarters) {
        quarter = quarter.value;
        if (!quarterStarts.hasOwnProperty(quarter)) {
            results.push(`Invalid quarter: ${quarter}`);
            continue;
        }

        const startMonth = quarterStarts[quarter];
        const startDate = new Date(year, startMonth - 1, 1);

        let endYear, endMonth;
        if (startMonth === 10) { // Special case for Q4
            endYear = parseInt(year) + 1;
            endMonth = 1;
        } else {
            endYear = year;
            endMonth = startMonth + 2;
        }
        const endDate = new Date(endYear, endMonth, 0);

        results.push([startDate.toDateString(), endDate.toDateString()]);
    }

    return results;
}