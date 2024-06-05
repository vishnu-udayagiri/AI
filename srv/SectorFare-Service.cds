using {Document as document, } from '../db/schema';

service SectorFareService @(path: '/sectorfareservice') {
    entity SectorFare as
        select
            ID                  as Id                  : String(40)     @title: 'ID',
            company             as Company             : String(4)      @title: 'Company',
            primaryDocumentNbr  as PrimaryDocumentNbr  : String(15)     @title: 'Primary Document Number',
            dateOfIssuance      as DateOfIssuance      : Date           @title: 'Date of issuance',
            transactionCode     as TransactionCode     : String(10)     @title: 'Trancation Code',
            issueIndicator      as IssueIndicator      : String(15)     @title: 'Issue Indicator',
            routingType         as RoutingType         : String(1)      @title: 'Routing Type',
            oneWayIndicator     as OneWayIndicator     : String(1)      @title: 'One Way Indicator',
            fullRouting         as FullRouting         : String(225)    @title: 'Full Routing',
            totalDocumentAmount as TotalDocumentAmount : Decimal(16, 2) @title: 'Total Document Amount'
        from document
        where
                status             =        'E03'
            and eventTypeShortCode not like '%X'
        order by
            DateOfIssuance     asc,
            TransactionCode    asc;

    function getCSRFToken()          returns String;
    action   Coupon(fields : String) returns String;
    action   InwardIndicator(Number : String,PrimaryDocumentNbr : String) returns String;

}
