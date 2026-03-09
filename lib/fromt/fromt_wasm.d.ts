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

export function fromt_build_signable_tx(key_share: Uint8Array, recipient_address: string, amount: bigint, fee_per_weight: bigint, fee_mask: bigint, inputs_data: Uint8Array, decoys_data: Uint8Array): Uint8Array;

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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_fromtkeyimportsession_free: (a: number, b: number) => void;
    readonly fromtkeyimportsession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: bigint) => [number, number, number];
    readonly fromtkeyimportsession_feed: (a: number, b: number, c: number) => number;
    readonly fromtkeyimportsession_takeMsg: (a: number) => any;
    readonly fromtkeyimportsession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly fromtkeyimportsession_result: (a: number) => [number, number, number];
    readonly __wbg_fromtdkgsession_free: (a: number, b: number) => void;
    readonly fromtdkgsession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: bigint) => [number, number, number];
    readonly fromtdkgsession_feed: (a: number, b: number, c: number) => number;
    readonly fromtdkgsession_takeMsg: (a: number) => any;
    readonly fromtdkgsession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly fromtdkgsession_result: (a: number) => [number, number, number];
    readonly __wbg_fromtsignsession_free: (a: number, b: number) => void;
    readonly fromtsignsession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly fromtsignsession_feed: (a: number, b: number, c: number) => number;
    readonly fromtsignsession_takeMsg: (a: number) => any;
    readonly fromtsignsession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly fromtsignsession_result: (a: number) => [number, number, number];
    readonly __wbg_fromtresharesession_free: (a: number, b: number) => void;
    readonly fromtresharesession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly fromtresharesession_feed: (a: number, b: number, c: number) => number;
    readonly fromtresharesession_takeMsg: (a: number) => any;
    readonly fromtresharesession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly fromtresharesession_result: (a: number) => [number, number, number];
    readonly fromtDkgSetupMsgNew: (a: number, b: number, c: number, d: number, e: number, f: bigint) => [number, number, number];
    readonly fromtSignSetupMsgNew: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly fromtReshareSetupMsgNew: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly fromtKeyImportSetupMsgNew: (a: number, b: number, c: number, d: number, e: number, f: bigint, g: number, h: number, i: number, j: number) => [number, number, number];
    readonly fromt_encode_identifier: (a: number) => [number, number, number, number];
    readonly fromt_decode_identifier: (a: number, b: number) => [number, number, number];
    readonly fromt_encode_map: (a: any) => [number, number, number, number];
    readonly fromt_derive_keys_from_seed: (a: number, b: number) => [number, number, number, number];
    readonly fromt_derive_view_key: (a: number, b: number) => [number, number, number, number];
    readonly fromt_derive_spend_pub_key: (a: number, b: number) => [number, number, number, number];
    readonly fromt_derive_address: (a: number, b: number) => [number, number, number, number];
    readonly fromt_derive_subaddress: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly fromt_compute_key_image: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly fromt_keyshare_birthday: (a: number, b: number) => [bigint, number, number];
    readonly fromt_keyshare_network: (a: number, b: number) => [number, number, number];
    readonly fromt_handle_free: (a: number) => [number, number];
    readonly __wbg_spendpreprocessresult_free: (a: number, b: number) => void;
    readonly spendpreprocessresult_handle_id: (a: number) => number;
    readonly spendpreprocessresult_preprocess: (a: number) => [number, number];
    readonly fromt_spend_preprocess: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly __wbg_spendsignresult_free: (a: number, b: number) => void;
    readonly spendsignresult_share: (a: number) => [number, number];
    readonly fromt_spend_sign: (a: number, b: number, c: number) => [number, number, number];
    readonly fromt_spend_complete: (a: number, b: number, c: number) => [number, number, number, number];
    readonly fromt_build_signable_tx: (a: number, b: number, c: number, d: number, e: bigint, f: bigint, g: bigint, h: number, i: number, j: number, k: number) => [number, number, number, number];
    readonly spendsignresult_handle_id: (a: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
