const { buildCommonQuery } = require("./query-builder/common.query.builder.helper");
const { buildQuery } = require("./query-builder/filter.query.builder.helper");
const { buildReportQuery } = require("./query-builder/report.query.builder.helper");

exports.getData = async(db,tableName,filters, pageNumber, pageSize, orderBy, dateFilterBy, isCountOnly=false, isParameterized = false, paramFilter = {}) =>{


    try {

        let query = '';

        switch (tableName) {
            case 'INVOICE':
                query = buildQuery(filters, pageNumber, pageSize, isCountOnly)
                break;
            case 'REPORT':
                query = buildReportQuery(filters, pageNumber, pageSize, isCountOnly)
                break;
            default:
                query = buildCommonQuery(tableName, filters, pageNumber, pageSize, orderBy, dateFilterBy, isCountOnly,isParameterized, paramFilter)

        }


        const result = await db.exec(query)
        return {
            success:true,
            message:'Data fetched successfully',
            data:result??[],
        };

    } catch (error) {

        return {
            success:false,
            message:'Error occurred while fetching data '+error,
            data:[],
        };
        
    }

    

}