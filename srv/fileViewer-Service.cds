using {ReportGenerator as reportGenerator} from '../db/schema';

service FileViewerService @(path: '/fileViewer') {
    entity ReportGenerator as projection on reportGenerator;
    function getReportDetails() returns String;
    function ReportDownloader(ID:String) returns String;
};
