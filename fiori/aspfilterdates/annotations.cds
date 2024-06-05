using ASPfilterdateService as service from '../../srv/aspfilterdate-Service';
@UI.DeleteHidden: true
@UI.CreateHidden: true
annotate service.ASPfilterdate with @(
    UI.LineItem : [
  {
                $Type : 'UI.DataField',
                Value : MONTH,
            },
            {
                $Type : 'UI.DataField',
                Value : YEAR,
            },
            {
                $Type : 'UI.DataField',
                Value : ARA_PERIOD_CLOSING_DATE,
            },
            {
                $Type : 'UI.DataField',
                Value : GST_APP_PERIOD_CLOSING_DATE,
            },
            {
                $Type : 'UI.DataField',
                Value : GST_APP_PROCESSING_PERIOD,
            },
            {
                $Type : 'UI.DataField',
                Value : ISCLOSED,
            },
            {
                $Type : 'UI.DataField',
                Value : CLOSED_ON,
            },
            {
                $Type : 'UI.DataField',
                Value : CLOSED_BY,
            },
    ]
);
annotate service.ASPfilterdate with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : MONTH,
            },
            {
                $Type : 'UI.DataField',
                Value : YEAR,
            },
            {
                $Type : 'UI.DataField',
                Value : ARA_PERIOD_CLOSING_DATE,
            },
            {
                $Type : 'UI.DataField',
                Value : GST_APP_PERIOD_CLOSING_DATE,
            },
            {
                $Type : 'UI.DataField',
                Value : GST_APP_PROCESSING_PERIOD,
            },
            {
                $Type : 'UI.DataField',
                Value : ISCLOSED,
            },
            {
                $Type : 'UI.DataField',
                Value : CLOSED_ON,
            },
            {
                $Type : 'UI.DataField',
                Value : CLOSED_BY,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
annotate service.ASPfilterdate with @(
    UI.HeaderInfo                   : {
        TypeName      : 'GST Period Closure',
        TypeNamePlural: 'GST Period Closure',
        Title         : {
            $Type: 'UI.DataField',
            Value: MONTH,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: MONTH
        },
    }
);