using DocumentHistoryService as service from '../../srv/documentHistory-Service';

@UI.DeleteHidden: true
annotate service.documentHistory with @(
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Label: 'Company',
            Value: company,
            @UI.Hidden
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax invoice type',
            Value: taxInvoiceType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Invoice number',
            Value: invoiceNumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'Invoice date',
            Value: invoiceDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Document type code',
            Value: documentTypeCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Acquisition type',
            Value: acquisitionType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Primary document number',
            Value: primaryDocumentNbr,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date of issuance',
            Value: dateOfIssuance,
        },
        {
            $Type: 'UI.DataField',
            Label: 'HSN code',
            Value: HSNCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'IATA number',
            Value: iataNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ticket number',
            Value: ticketNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'RFISC',
            Value: RFISC,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Section type',
            Value: sectionType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Passenger GSTIN',
            Value: passengerGSTIN,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Passanger name',
            Value: passangerName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Full routing',
            Value: fullRouting,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Routing type',
            Value: routingType,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Class',
            Value: class,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Place of embarkation',
            Value: placeoOfEmbarkation,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Place of disembarkation',
            Value: placeoOfDisembarkation,
        },
        {
            $Type: 'UI.DataField',
            Label: 'xoNo',
            Value: xoNo,
        },
        {
            $Type: 'UI.DataField',
            Label: 'UID in case of embassy',
            Value: uidNniInCaseOfEmbassy,
        },
        {
            $Type: 'UI.DataField',
            Label: 'FOP',
            Value: fop,
        },
        {
            $Type: 'UI.DataField',
            Label: 'PAN',
            Value: pan,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Endorsement Details',
            Value: endorsementDtls,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Remarks on ACM/ADM',
            Value: remarksOnACMADM,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Remarks on RF7',
            Value: remarksOnRF7,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Excess baggage weight PCS',
            Value: excessBaggageWeightPCS,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Excess baggage rate',
            Value: excessBaggageRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Base amount',
            Value: baseAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax1',
            Value: tax1,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 1',
            Value: taxAmount1,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 2',
            Value: tax2,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 2',
            Value: taxAmount2,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 3',
            Value: tax3,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 3',
            Value: taxAmount3,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 4',
            Value: tax4,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 4',
            Value: taxAmount4,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 5',
            Value: tax5,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 5',
            Value: taxAmount5,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 6',
            Value: tax6,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 6',
            Value: taxAmount6,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 7',
            Value: tax7,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 7',
            Value: taxAmount7,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 8',
            Value: tax8,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 8',
            Value: taxAmount8,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 9',
            Value: tax9,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 9',
            Value: taxAmount9,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 10',
            Value: tax10,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 10',
            Value: taxAmount10,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 11',
            Value: tax11,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 11',
            Value: taxAmount11,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 12',
            Value: tax12,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 12',
            Value: taxAmount12,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 13',
            Value: tax13,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 13',
            Value: taxAmount13,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 14',
            Value: tax14,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 14',
            Value: taxAmount14,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 15',
            Value: tax15,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 15',
            Value: taxAmount15,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 16',
            Value: tax16,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 16',
            Value: taxAmount16,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 17',
            Value: tax17,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 17',
            Value: taxAmount17,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 18',
            Value: tax18,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 18',
            Value: taxAmount18,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 19',
            Value: tax19,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 19',
            Value: taxAmount19,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax 20',
            Value: tax20,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tax amount 20',
            Value: taxAmount20,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total document amount',
            Value: totalDocumentAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total taxable value',
            Value: totalTaxableValue,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Discount',
            Value: discount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Net taxable value',
            Value: netTaxableValue,
        },
        {
            $Type: 'UI.DataField',
            Label: 'CGST amount',
            Value: cgstAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'CGST rate',
            Value: cgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'SGST amount',
            Value: sgstAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'SGST rate',
            Value: sgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'UTGST amount',
            Value: utgstAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'UTGST rate',
            Value: utgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'IGST amount',
            Value: igstAmount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'IGST rate',
            Value: igstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total rate',
            Value: totalRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'GST Value',
            Value: gstValue,
        },
        {
            $Type: 'UI.DataField',
            Label: 'AI GSTIN No',
            Value: AIGstinNo,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Address ff the corporate',
            Value: addressOfTheCorporate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Place of supply',
            Value: placeOfSupply,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Contact No of the corporate',
            Value: contactNooftheCorporate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Email id of corporate',
            Value: emailIdOfCorporate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'State',
            Value: State,
        },
        {
            $Type: 'UI.DataField',
            Label: 'State code',
            Value: stateCode,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Liability discharge state',
            Value: liabilityDischargeState,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund sector',
            Value: refundSector,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund CP charge',
            Value: refundCPcharge,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund No show charges',
            Value: refundNoShowCharges,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund TTL CP CHGS',
            Value: refundTTLCPCHGS,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund CGST',
            Value: refundCGST,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund CGST Rate',
            Value: refundCGSTRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund SGST/UTGST',
            Value: refundsgstutgst,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund SGST/UTGST Rate',
            Value: refundsgstutgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund IGST',
            Value: refundIgst,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund IGST Rate',
            Value: refundIgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Refund GST Amt',
            Value: refundGstAmt,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue sector',
            Value: reissueSector,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue Xpod charges',
            Value: reissueXpodCharges,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue charges for travel',
            Value: reissueChargesForTravel,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue rebooking',
            Value: reissueRebooking,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue CGST',
            Value: reissueCGST,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue CGST Rate',
            Value: reissueCgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue SGST/UTGST',
            Value: reissueSgstutgst,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue SGST/UTGST Rate',
            Value: reissueSgstutgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue IGST',
            Value: reissueIgst,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue IGST Rate',
            Value: reissueIgstRate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Reissue GST amount',
            Value: reissueGstAmt,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Original file name',
            Value: originalFilename,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Converted file name',
            Value: convertedFilename,
        }
    ],
    UI.HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Document History',
        TypeNamePlural: 'Document History'
    },
    UI.SelectionFields: [
        iataNumber,
        ticketNumber,
        invoiceNumber,
        invoiceDate,
        dateOfIssuance,
        AIGstinNo,
        passengerGSTIN,
        passangerName,
        primaryDocumentNbr
    ]
);

annotate service.documentHistory with {
    iataNumber         @Common: {
        ValueListWithFixedValues: false,
        title                   : 'IATA Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListIataNumber',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: iataNumber,
                    ValueListProperty: 'iataNumber'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'legalName'
                }
            ]
        }
    };

    ticketNumber       @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Ticket Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListTicketNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: ticketNumber,
                ValueListProperty: 'ticketNumber'
            }]
        }
    };

    invoiceNumber      @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Invoice Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListInvoiceNumber',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: invoiceNumber,
                ValueListProperty: 'invoiceNumber'
            }]
        }
    };

    AIGstinNo          @Common: {
        ValueListWithFixedValues: false,
        title                   : 'AI GSTIN',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListSupplierGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: AIGstinNo,
                ValueListProperty: 'AIGstinNo'
            }]
        }
    };

    passengerGSTIN     @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Passenger GSTIN',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListPassengerGSTIN',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: passengerGSTIN,
                ValueListProperty: 'passengerGSTIN'
            }]
        }
    };

    passangerName      @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Passenger Name',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListPassengerName',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: passangerName,
                ValueListProperty: 'passangerName'
            }]
        }
    };
    primaryDocumentNbr @Common: {
        ValueListWithFixedValues: false,
        title                   : 'Primary Document Number',
        ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'valueListprimaryDocumentNbr',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: primaryDocumentNbr,
                ValueListProperty: 'primaryDocumentNbr'
            }]
        }
    }@title: 'Primary Document Number';
}
