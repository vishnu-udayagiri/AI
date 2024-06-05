using {OTAGSTINMaster as oTAGSTINMaster

} from '../db/schema';

service otagstinMaster @(path: '/otagstinmaster') {

    @odata.draft.enabled
    entity otagstinmaster as projection on oTAGSTINMaster;
    
}
