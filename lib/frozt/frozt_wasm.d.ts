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
