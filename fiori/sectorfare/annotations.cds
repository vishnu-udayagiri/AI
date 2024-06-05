using SectorFareService as service from '../../srv/SectorFare-Service';
@UI.DeleteHidden : true
annotate service.SectorFare with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: Company,
        },
        {
            $Type: 'UI.DataField',
            Value: PrimaryDocumentNbr,
        },
        {
            $Type: 'UI.DataField',
            Value: DateOfIssuance,
        },
        {
            $Type: 'UI.DataField',
            Value: TransactionCode,
        },
        {
            $Type: 'UI.DataField',
            Value: IssueIndicator,
        },
        {
            $Type: 'UI.DataField',
            Value: RoutingType,
        },
        {
            $Type: 'UI.DataField',
            Value: OneWayIndicator,
        },
        {
            $Type: 'UI.DataField',
            Value: FullRouting,
        },
        {
            $Type: 'UI.DataField',
            Value: TotalDocumentAmount,
        },
    ],
    UI.SelectionFields: [DateOfIssuance]
);

annotate service.SectorFare with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'Sector Fare',
    TypeNamePlural: 'Sector Fare',
    Title         : {
        $Type: 'UI.DataField',
        Value: Company,
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: Company,
    }

}

);
