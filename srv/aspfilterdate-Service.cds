using {ASPFILINGDATES as aSPFILINGDATES

} from '../db/schema';


service ASPfilterdateService @(path: '/aspfilterdate') {
  @odata.draft.enabled
  entity ASPfilterdate as projection on aSPFILINGDATES;

  function getCSRFToken()          returns String;
  action   Create(fields : String) returns String;
  action   Edit(fields : String) returns String;
}
