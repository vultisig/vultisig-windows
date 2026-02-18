export namespace agent {
	
	export class AuthTokenInfo {
	    connected: boolean;
	    expiresAt: time.Time;
	
	    static createFrom(source: any = {}) {
	        return new AuthTokenInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.connected = source["connected"];
	        this.expiresAt = this.convertValues(source["expiresAt"], time.Time);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ServiceStatus {
	    fastVaultServer: boolean;
	    verifier: boolean;
	    agentBackend: boolean;
	    authenticated: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ServiceStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fastVaultServer = source["fastVaultServer"];
	        this.verifier = source["verifier"];
	        this.agentBackend = source["agentBackend"];
	        this.authenticated = source["authenticated"];
	    }
	}

}

export namespace backend {
	
	export class Conversation {
	    id: string;
	    public_key: string;
	    title?: string;
	    created_at: time.Time;
	    updated_at: time.Time;
	    archived_at?: time.Time;
	
	    static createFrom(source: any = {}) {
	        return new Conversation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.public_key = source["public_key"];
	        this.title = source["title"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.archived_at = this.convertValues(source["archived_at"], time.Time);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Message {
	    id: string;
	    conversation_id: string;
	    role: string;
	    content: string;
	    content_type: string;
	    metadata?: number[];
	    created_at: time.Time;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.conversation_id = source["conversation_id"];
	        this.role = source["role"];
	        this.content = source["content"];
	        this.content_type = source["content_type"];
	        this.metadata = source["metadata"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConversationWithMessages {
	    id: string;
	    public_key: string;
	    title?: string;
	    created_at: time.Time;
	    updated_at: time.Time;
	    archived_at?: time.Time;
	    messages: Message[];
	
	    static createFrom(source: any = {}) {
	        return new ConversationWithMessages(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.public_key = source["public_key"];
	        this.title = source["title"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.archived_at = this.convertValues(source["archived_at"], time.Time);
	        this.messages = this.convertValues(source["messages"], Message);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace storage {
	
	export class AddressBookItem {
	    id: string;
	    title: string;
	    address: string;
	    chain: string;
	    order: number;
	
	    static createFrom(source: any = {}) {
	        return new AddressBookItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.address = source["address"];
	        this.chain = source["chain"];
	        this.order = source["order"];
	    }
	}
	export class Coin {
	    id: string;
	    chain: string;
	    address: string;
	    ticker: string;
	    contract_address: string;
	    is_native_token: boolean;
	    logo: string;
	    price_provider_id: string;
	    decimals: number;
	
	    static createFrom(source: any = {}) {
	        return new Coin(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.chain = source["chain"];
	        this.address = source["address"];
	        this.ticker = source["ticker"];
	        this.contract_address = source["contract_address"];
	        this.is_native_token = source["is_native_token"];
	        this.logo = source["logo"];
	        this.price_provider_id = source["price_provider_id"];
	        this.decimals = source["decimals"];
	    }
	}
	export class KeyShare {
	    public_key: string;
	    keyshare: string;
	
	    static createFrom(source: any = {}) {
	        return new KeyShare(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.public_key = source["public_key"];
	        this.keyshare = source["keyshare"];
	    }
	}
	export class Vault {
	    name: string;
	    public_key_ecdsa: string;
	    public_key_eddsa: string;
	    signers: string[];
	    created_at: time.Time;
	    hex_chain_code: string;
	    keyshares: KeyShare[];
	    local_party_id: string;
	    reshare_prefix: string;
	    order: number;
	    is_backed_up: boolean;
	    coins: Coin[];
	    folder_id?: string;
	    lib_type: string;
	    last_password_verification_time: number;
	    chain_public_keys?: Record<string, string>;
	    chain_key_shares?: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new Vault(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.public_key_ecdsa = source["public_key_ecdsa"];
	        this.public_key_eddsa = source["public_key_eddsa"];
	        this.signers = source["signers"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.hex_chain_code = source["hex_chain_code"];
	        this.keyshares = this.convertValues(source["keyshares"], KeyShare);
	        this.local_party_id = source["local_party_id"];
	        this.reshare_prefix = source["reshare_prefix"];
	        this.order = source["order"];
	        this.is_backed_up = source["is_backed_up"];
	        this.coins = this.convertValues(source["coins"], Coin);
	        this.folder_id = source["folder_id"];
	        this.lib_type = source["lib_type"];
	        this.last_password_verification_time = source["last_password_verification_time"];
	        this.chain_public_keys = source["chain_public_keys"];
	        this.chain_key_shares = source["chain_key_shares"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class VaultFolder {
	    id: string;
	    name: string;
	    order: number;
	
	    static createFrom(source: any = {}) {
	        return new VaultFolder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.order = source["order"];
	    }
	}

}

export namespace time {
	
	export class Time {
	
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace tss {
	
	export class KeysignResponse {
	    msg: string;
	    r: string;
	    s: string;
	    der_signature: string;
	    recovery_id: string;
	
	    static createFrom(source: any = {}) {
	        return new KeysignResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.msg = source["msg"];
	        this.r = source["r"];
	        this.s = source["s"];
	        this.der_signature = source["der_signature"];
	        this.recovery_id = source["recovery_id"];
	    }
	}

}

