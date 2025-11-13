export class PayResponse {
    id?: number;
    date_created?: string;
    date_approved?: string;
    date_last_updated?: string;
    status?: string;
    status_detail?: string;
    currency_id?: string;
    description?: string;
    payment_method_id?: string;
    payment_type_id?: string;
    transaction_amount?: number;
    transaction_amount_refunded?: number;
    installments?: number;
    collector_id?: number;
    external_reference?: string;
    payer?: Payer;
    transaction_details?: TransactionDetails;
    point_of_interaction?: PointOfInteraction;

    constructor(
        id?: number,
        date_created?: string,
        date_approved?: string,
        date_last_updated?: string,
        status?: string,
        status_detail?: string,
        currency_id?: string,
        description?: string,
        payment_method_id?: string,
        payment_type_id?: string,
        transaction_amount?: number,
        transaction_amount_refunded?: number,
        installments?: number,
        collector_id?: number,
        external_reference?: string,
        payer?: Payer,
        transaction_details?: TransactionDetails,
        point_of_interaction?: PointOfInteraction
    ) {
        this.id = id;
        this.date_created = date_created;
        this.date_approved = date_approved;
        this.date_last_updated = date_last_updated;
        this.status = status;
        this.status_detail = status_detail;
        this.currency_id = currency_id;
        this.description = description;
        this.payment_method_id = payment_method_id;
        this.payment_type_id = payment_type_id;
        this.transaction_amount = transaction_amount;
        this.transaction_amount_refunded = transaction_amount_refunded;
        this.installments = installments;
        this.collector_id = collector_id;
        this.external_reference = external_reference;
        this.payer = payer;
        this.transaction_details = transaction_details;
        this.point_of_interaction = point_of_interaction;
    }
}

export class Payer {
    id?: string;
    email?: string;
    identification?: Identification;
    first_name?: string | null;
    last_name?: string | null;

    constructor(
        id?: string,
        email?: string,
        identification?: Identification,
        first_name?: string | null,
        last_name?: string | null
    ) {
        this.id = id;
        this.email = email;
        this.identification = identification;
        this.first_name = first_name;
        this.last_name = last_name;
    }
}

export class Identification {
    type?: string;
    number?: string;

    constructor(type?: string, number?: string) {
        this.type = type;
        this.number = number;
    }
}

export class TransactionDetails {
    net_received_amount?: number;
    total_paid_amount?: number;
    installment_amount?: number;
    external_resource_url?: string | null;

    constructor(
        net_received_amount?: number,
        total_paid_amount?: number,
        installment_amount?: number,
        external_resource_url?: string | null
    ) {
        this.net_received_amount = net_received_amount;
        this.total_paid_amount = total_paid_amount;
        this.installment_amount = installment_amount;
        this.external_resource_url = external_resource_url;
    }
}

export class PointOfInteraction {
    type?: string;
    transaction_data?: TransactionData;

    constructor(type?: string, transaction_data?: TransactionData) {
        this.type = type;
        this.transaction_data = transaction_data;
    }
}

export class TransactionData {
    qr_code?: string | null;
    ticket_url?: string | null;
    external_resource_url?: string | null;

    constructor(
        qr_code?: string | null,
        ticket_url?: string | null,
        external_resource_url?: string | null
    ) {
        this.qr_code = qr_code;
        this.ticket_url = ticket_url;
        this.external_resource_url = external_resource_url;
    }
}