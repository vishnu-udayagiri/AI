using {
    Document      as document,

} from '../db/schema';
service documentService @(path: '/document') {
    @odata.draft.enabled
    entity Document   as projection on document;
}