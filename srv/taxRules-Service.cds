using {
    AirportCodes     as airportCodes,
    TransactionTypes as transactionTypes,
    BookingClass     as bookingClass,
    Company          as company,
    StateCodes       as stateCodes,
    EMDRFISC         as tEMDRFISC,
    AirportMaster as airportMaster
} from '../db/schema';

service taxRuleService @(path: '/taxRule') {

    entity AirportCodes     as projection on airportCodes;
    entity TransactionTypes as projection on transactionTypes;
    entity BookingClass     as projection on bookingClass;
    entity Company          as projection on company;
    entity StateCodes       as projection on stateCodes;
    entity EMDRFISC         as projection on tEMDRFISC;
        entity AirportMaster as projection on airportMaster;
    function getFilterDetails()        returns String;
    action   getTaxRule(Data : String) returns String;
}
