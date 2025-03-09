export namespace storage {
	
	export class AddressBookItem {
	    ID: number[];
	    Title: string;
	    Address: string;
	    Chain: string;
	    Order: number;
	
	    static createFrom(source: any = {}) {
	        return new AddressBookItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Title = source["Title"];
	        this.Address = source["Address"];
	        this.Chain = source["Chain"];
	        this.Order = source["Order"];
	    }
	}
	export class Coin {
	    id: string;
	    chain: string;
	    address: string;
	    hex_public_key: string;
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
	        this.hex_public_key = source["hex_public_key"];
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
	    // Go type: time
	    created_at: any;
	    hex_chain_code: string;
	    keyshares: KeyShare[];
	    local_party_id: string;
	    reshare_prefix: string;
	    order: number;
	    is_backed_up: boolean;
	    coins: Coin[];
	    folder_id?: string;
	    lib_type: string;
	
	    static createFrom(source: any = {}) {
	        return new Vault(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.public_key_ecdsa = source["public_key_ecdsa"];
	        this.public_key_eddsa = source["public_key_eddsa"];
	        this.signers = source["signers"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.hex_chain_code = source["hex_chain_code"];
	        this.keyshares = this.convertValues(source["keyshares"], KeyShare);
	        this.local_party_id = source["local_party_id"];
	        this.reshare_prefix = source["reshare_prefix"];
	        this.order = source["order"];
	        this.is_backed_up = source["is_backed_up"];
	        this.coins = this.convertValues(source["coins"], Coin);
	        this.folder_id = source["folder_id"];
	        this.lib_type = source["lib_type"];
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

