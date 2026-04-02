import { edit } from "../(pages)/icons";

export const ROUTES = {
    restore_item: '/items/restore',

    add_state: '/database/state/add',
    restore_state:'/database/state/restore',
    edit_state: '/database/state/edit',

    add_city: '/database/city/add',
    restore_city: '/database/city/restore',
    edit_city: '/database/city/edit',

    add_customer: '/sales/customer/add',
    restore_customer: '/sales/customer/restore/',
    view_customer: '/sales/customer/view',
    update_customer: '/sales/customer/update',
    view_invoice: '/sales/invoice/view-invoice',
    new_invoice: '/sales/invoice/new-invoice',

    add_vendor: '/purchase/vendor/add',
    restore_vendor:'/purchase/vendor/restore',
    view_vendor_details:'/purchase/vendor/view',

    add_bill: '/purchase/bills/bill',
    view_bill: '/purchase/bills/view',
    bill_payment: '/purchase/vendor/bill_payment',

    generate_invoice: '/sales/invoice/generate-invoice',
    deleted_invoices: '/sales/invoice/restore',
    
}