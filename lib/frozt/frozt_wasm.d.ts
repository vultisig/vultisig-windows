/* tslint:disable */
/* eslint-disable */

export class FroztDkgSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, birthday: bigint): FroztDkgSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): Uint8Array;
    takeMsg(): Uint8Array | undefined;
}

export class FroztKeyImportSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, seed: Uint8Array, account_index: number, birthday: bigint): FroztKeyImportSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): Uint8Array;
    takeMsg(): Uint8Array | undefined;
}

export class FroztReshareSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, old_key_package: Uint8Array): FroztReshareSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): any;
    takeMsg(): Uint8Array | undefined;
}

export class FroztSignSession {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    feed(msg: Uint8Array): boolean;
    static fromSetup(setup_bytes: Uint8Array, my_party_name: string, key_package: Uint8Array, pub_key_package: Uint8Array): FroztSignSession;
    static fromSetupWithAlpha(setup_bytes: Uint8Array, my_party_name: string, key_package: Uint8Array, pub_key_package: Uint8Array, alpha: Uint8Array): FroztSignSession;
    msgReceiver(msg: Uint8Array, index: number): string | undefined;
    result(): Uint8Array;
    takeMsg(): Uint8Array | undefined;
}

export class WasmSaplingKeys {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly address: string;
    readonly ivk: Uint8Array;
    readonly nk: Uint8Array;
}

export class WasmSaplingProver {
    free(): void;
    [Symbol.dispose](): void;
    createBuilder(pkp_bytes: Uint8Array, extras_bytes: Uint8Array, target_height: number): WasmTxBuilder;
    constructor(spend_params_bytes: Uint8Array, output_params_bytes: Uint8Array);
}

export class WasmSaplingTree {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    append(cmu: Uint8Array): void;
    static fromHexState(hex_state: string): WasmSaplingTree;
    witness(): WasmSaplingWitness;
}

export class WasmSaplingWitness {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    append(cmu: Uint8Array): void;
    static fromBytes(data: Uint8Array): WasmSaplingWitness;
    root(): Uint8Array;
    serialize(): Uint8Array;
}

export class WasmShieldingTxBuilder {
    free(): void;
    [Symbol.dispose](): void;
    addInput(prev_txid: Uint8Array, vout: number, value: number, script_pubkey: Uint8Array): void;
    addOutput(address: string, amount: number): void;
    addTransparentOutput(address: string, amount: number): void;
    build(): void;
    complete(ecdsa_sigs: Uint8Array, pubkeys: Uint8Array): Uint8Array;
    constructor(output_params_bytes: Uint8Array, extras_bytes: Uint8Array, target_height: number);
    readonly numInputs: number;
    readonly sighashes: Uint8Array;
}

export class WasmTxBuilder {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    addOutput(address: string, amount: number): void;
    addSpend(note_data: Uint8Array, witness_data: Uint8Array): Uint8Array;
    build(): void;
    complete(spend_auth_sigs: Uint8Array): Uint8Array;
    readonly alpha: Uint8Array;
    readonly alphas: Uint8Array;
    readonly numSpends: number;
    readonly sighash: Uint8Array;
}

export function encode_map(entries: any): Uint8Array;

export function froztDkgSetupMsgNew(max_signers: number, min_signers: number, parties_data: Uint8Array, birthday: bigint): Uint8Array;

export function froztKeyImportSetupMsgNew(max_signers: number, min_signers: number, parties_data: Uint8Array, birthday: bigint, seed_holder_id: number, seed: Uint8Array, account_index: number): Uint8Array;

export function froztReshareSetupMsgNew(max_signers: number, min_signers: number, parties_data: Uint8Array, old_identifiers_data: Uint8Array, expected_vk: Uint8Array): Uint8Array;

export function froztSignSetupMsgNew(msg_to_sign: Uint8Array, parties_data: Uint8Array): Uint8Array;

export function frozt_encode_identifier(id: number): Uint8Array;

export function frozt_keypackage_identifier(key_package: Uint8Array): number;

export function frozt_keyshare_bundle_birthday(bundle: Uint8Array): bigint;

export function frozt_keyshare_bundle_key_package(bundle: Uint8Array): Uint8Array;

export function frozt_keyshare_bundle_pack(key_package: Uint8Array, pub_key_package: Uint8Array, sapling_extras: Uint8Array, birthday: bigint): Uint8Array;

export function frozt_keyshare_bundle_pub_key_package(bundle: Uint8Array): Uint8Array;

export function frozt_keyshare_bundle_sapling_extras(bundle: Uint8Array): Uint8Array;

export function frozt_pubkeypackage_verifying_key(pub_key_package: Uint8Array): Uint8Array;

export function frozt_sapling_build_dfvk(pub_key_package: Uint8Array, sapling_extras: Uint8Array): Uint8Array;

export function frozt_sapling_compute_nullifier(dfvk_bytes: Uint8Array, note_data: Uint8Array, position: bigint, height: bigint): Uint8Array;

export function frozt_sapling_decrypt_note_full(ivk: Uint8Array, cmu: Uint8Array, ephemeral_key: Uint8Array, enc_ciphertext: Uint8Array, height: bigint): Uint8Array;

export function frozt_sapling_derive_keys(pub_key_package: Uint8Array, sapling_extras: Uint8Array): WasmSaplingKeys;

export function frozt_sapling_generate_extras(): Uint8Array;

export function frozt_sapling_tree_size(hex_state: string): bigint;

export function frozt_sapling_try_decrypt_compact(ivk: Uint8Array, cmu: Uint8Array, ephemeral_key: Uint8Array, ciphertext: Uint8Array, height: bigint): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_froztdkgsession_free: (a: number, b: number) => void;
    readonly froztdkgsession_fromSetup: (a: number, b: number, c: number, d: number, e: bigint) => [number, number, number];
    readonly froztdkgsession_feed: (a: number, b: number, c: number) => number;
    readonly froztdkgsession_takeMsg: (a: number) => any;
    readonly froztdkgsession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly froztdkgsession_result: (a: number) => [number, number, number];
    readonly __wbg_froztkeyimportsession_free: (a: number, b: number) => void;
    readonly froztkeyimportsession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: bigint) => [number, number, number];
    readonly froztkeyimportsession_feed: (a: number, b: number, c: number) => number;
    readonly froztkeyimportsession_takeMsg: (a: number) => any;
    readonly froztkeyimportsession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly froztkeyimportsession_result: (a: number) => [number, number, number];
    readonly __wbg_froztsignsession_free: (a: number, b: number) => void;
    readonly froztsignsession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly froztsignsession_fromSetupWithAlpha: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number];
    readonly froztsignsession_feed: (a: number, b: number, c: number) => number;
    readonly froztsignsession_takeMsg: (a: number) => any;
    readonly froztsignsession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly froztsignsession_result: (a: number) => [number, number, number];
    readonly __wbg_froztresharesession_free: (a: number, b: number) => void;
    readonly froztresharesession_fromSetup: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly froztresharesession_feed: (a: number, b: number, c: number) => number;
    readonly froztresharesession_takeMsg: (a: number) => any;
    readonly froztresharesession_msgReceiver: (a: number, b: number, c: number, d: number) => [number, number];
    readonly froztresharesession_result: (a: number) => [number, number, number];
    readonly froztDkgSetupMsgNew: (a: number, b: number, c: number, d: number, e: bigint) => [number, number, number];
    readonly froztSignSetupMsgNew: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly froztReshareSetupMsgNew: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly froztKeyImportSetupMsgNew: (a: number, b: number, c: number, d: number, e: bigint, f: number, g: number, h: number, i: number) => [number, number, number];
    readonly frozt_sapling_build_dfvk: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly frozt_sapling_generate_extras: () => [number, number, number, number];
    readonly __wbg_wasmsaplingkeys_free: (a: number, b: number) => void;
    readonly wasmsaplingkeys_address: (a: number) => [number, number];
    readonly wasmsaplingkeys_ivk: (a: number) => [number, number];
    readonly wasmsaplingkeys_nk: (a: number) => [number, number];
    readonly frozt_sapling_derive_keys: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly frozt_sapling_try_decrypt_compact: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: bigint) => [number, number, number];
    readonly frozt_sapling_decrypt_note_full: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: bigint) => [number, number, number, number];
    readonly frozt_sapling_compute_nullifier: (a: number, b: number, c: number, d: number, e: bigint, f: bigint) => [number, number, number, number];
    readonly frozt_encode_identifier: (a: number) => [number, number, number, number];
    readonly frozt_keypackage_identifier: (a: number, b: number) => [number, number, number];
    readonly frozt_pubkeypackage_verifying_key: (a: number, b: number) => [number, number, number, number];
    readonly frozt_keyshare_bundle_pack: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint) => [number, number, number, number];
    readonly frozt_keyshare_bundle_birthday: (a: number, b: number) => [bigint, number, number];
    readonly frozt_keyshare_bundle_key_package: (a: number, b: number) => [number, number, number, number];
    readonly frozt_keyshare_bundle_pub_key_package: (a: number, b: number) => [number, number, number, number];
    readonly frozt_keyshare_bundle_sapling_extras: (a: number, b: number) => [number, number, number, number];
    readonly encode_map: (a: any) => [number, number, number, number];
    readonly __wbg_wasmsaplingprover_free: (a: number, b: number) => void;
    readonly wasmsaplingprover_new: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasmsaplingprover_createBuilder: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly __wbg_wasmtxbuilder_free: (a: number, b: number) => void;
    readonly wasmtxbuilder_addSpend: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly wasmtxbuilder_addOutput: (a: number, b: number, c: number, d: number) => [number, number];
    readonly wasmtxbuilder_build: (a: number) => [number, number];
    readonly wasmtxbuilder_sighash: (a: number) => [number, number];
    readonly wasmtxbuilder_alpha: (a: number) => [number, number];
    readonly wasmtxbuilder_alphas: (a: number) => [number, number];
    readonly wasmtxbuilder_numSpends: (a: number) => number;
    readonly wasmtxbuilder_complete: (a: number, b: number, c: number) => [number, number, number, number];
    readonly __wbg_wasmsaplingtree_free: (a: number, b: number) => void;
    readonly wasmsaplingtree_fromHexState: (a: number, b: number) => [number, number, number];
    readonly wasmsaplingtree_append: (a: number, b: number, c: number) => [number, number];
    readonly wasmsaplingtree_witness: (a: number) => [number, number, number];
    readonly frozt_sapling_tree_size: (a: number, b: number) => [bigint, number, number];
    readonly __wbg_wasmsaplingwitness_free: (a: number, b: number) => void;
    readonly wasmsaplingwitness_append: (a: number, b: number, c: number) => [number, number];
    readonly wasmsaplingwitness_root: (a: number) => [number, number, number, number];
    readonly wasmsaplingwitness_serialize: (a: number) => [number, number, number, number];
    readonly wasmsaplingwitness_fromBytes: (a: number, b: number) => [number, number, number];
    readonly __wbg_wasmshieldingtxbuilder_free: (a: number, b: number) => void;
    readonly wasmshieldingtxbuilder_new: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly wasmshieldingtxbuilder_addInput: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly wasmshieldingtxbuilder_addOutput: (a: number, b: number, c: number, d: number) => [number, number];
    readonly wasmshieldingtxbuilder_addTransparentOutput: (a: number, b: number, c: number, d: number) => [number, number];
    readonly wasmshieldingtxbuilder_build: (a: number) => [number, number];
    readonly wasmshieldingtxbuilder_sighashes: (a: number) => [number, number];
    readonly wasmshieldingtxbuilder_numInputs: (a: number) => number;
    readonly wasmshieldingtxbuilder_complete: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
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
