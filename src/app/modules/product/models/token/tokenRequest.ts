export default class TokenRequest {
    client_id?: string;
    client_secret?: string;
    grant_type?:string;

    constructor(client_id: string, client_secret: string) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.grant_type = 'client_credentials';
    }
    
}