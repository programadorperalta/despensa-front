export default class TokenResponse {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
    user_id?: number;
    live_mode?: string;

    constructor(access_token?: string, token_type?: string, expires_in?: number, scope?: string, user_id?: number, live_mode?: string) {
        this.access_token = access_token;
        this.token_type = token_type;
        this.expires_in = expires_in;
        this.scope = scope;
        this.user_id = user_id;
        this.live_mode = live_mode;
    }
}