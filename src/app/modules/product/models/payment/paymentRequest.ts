export class PayReq {
    access_token: string | null;
    user_id: number | null; 

    constructor(access_token: string | null, user_id: number | null) {
        this.access_token = access_token;
        this.user_id = user_id;
    }
}
