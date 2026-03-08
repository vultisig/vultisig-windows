/* tslint:disable */
/* eslint-disable */

export class FromtDkgSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, network: number, birthday: bigint): FromtDkgSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): Uint8Array;
    takeMsg(): Uint8Array | undefined;
}

export class FromtKeyImportSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, spend_key: Uint8Array, network: number, birthday: bigint): FromtKeyImportSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): Uint8Array;
    takeMsg(): Uint8Array | undefined;
}

export class FromtReshareSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, old_key_package: Uint8Array): FromtReshareSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): any;
    takeMsg(): Uint8Array | undefined;
}

export class FromtSignSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, key_package: Uint8Array, pub_key_package: Uint8Array): FromtSignSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): Uint8Array;
    takeMsg(): Uint8Array | undefined;
}

export class SpendPreprocessResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly handle_id: number;
    readonly preprocess: Uint8Array;
}

export class SpendSignResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly handle_id: number;
    readonly share: Uint8Array;
}

export function fromtDkgSetupMsgNew(max_signers: number, min_signers: number, parties_data: Uint8Array, network: number, birthday: bigint): Uint8Array;

export function fromtKeyImportSetupMsgNew(max_signers: number, min_signers: number, parties_data: Uint8Array, network: number, birthday: bigint, seed_holder_id: number, seed: Uint8Array, account_index: number): Uint8Array;

export function fromtReshareSetupMsgNew(max_signers: number, min_signers: number, parties_data: Uint8Array, old_identifiers_data: Uint8Array, expected_vk: Uint8Array): Uint8Array;

export function fromtSignSetupMsgNew(msg_to_sign: Uint8Array, parties_data: Uint8Array): Uint8Array;

export function fromt_compute_key_image(key_offset: Uint8Array, output_key: Uint8Array, spend_key: Uint8Array): Uint8Array;

export function fromt_decode_identifier(id_bytes: Uint8Array): number;

export function fromt_derive_address(key_share: Uint8Array): string;

export function fromt_derive_keys_from_seed(seed: Uint8Array): Uint8Array;

export function fromt_derive_spend_pub_key(key_share: Uint8Array): Uint8Array;

export function fromt_derive_subaddress(key_share: Uint8Array, account: number, index: number): string;

export function fromt_derive_view_key(key_share: Uint8Array): Uint8Array;

export function fromt_encode_identifier(id: number): Uint8Array;

export function fromt_encode_map(entries: any): Uint8Array;

export function fromt_handle_free(handle_id: number): void;

export function fromt_keyshare_birthday(key_share: Uint8Array): bigint;

export function fromt_keyshare_network(key_share: Uint8Array): number;

export function fromt_spend_complete(handle_id: number, shares_map: Uint8Array): Uint8Array;

export function fromt_spend_preprocess(key_share: Uint8Array, signable_tx: Uint8Array): SpendPreprocessResult;

export function fromt_spend_sign(handle_id: number, preprocesses_map: Uint8Array): SpendSignResult;
