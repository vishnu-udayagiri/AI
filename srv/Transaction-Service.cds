using {
    Document as document,
    Coupon as coupon,
} from '../db/schema';

service TransactionService @(path: '/transaction') {
    entity Document as projection on document;
    entity Coupon as projection on coupon;
}
