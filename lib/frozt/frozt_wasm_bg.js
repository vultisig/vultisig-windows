export class WasmSaplingKeys {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSaplingKeys.prototype);
        obj.__wbg_ptr = ptr;
        WasmSaplingKeysFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSaplingKeysFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsaplingkeys_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmsaplingkeys_address(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Uint8Array}
     */
    get ivk() {
        const ret = wasm.wasmsaplingkeys_ivk(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get nk() {
        const ret = wasm.wasmsaplingkeys_nk(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) WasmSaplingKeys.prototype[Symbol.dispose] = WasmSaplingKeys.prototype.free;

export class WasmSaplingProver {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSaplingProverFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsaplingprover_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} pkp_bytes
     * @param {Uint8Array} extras_bytes
     * @param {number} target_height
     * @returns {WasmTxBuilder}
     */
    createBuilder(pkp_bytes, extras_bytes, target_height) {
        const ptr0 = passArray8ToWasm0(pkp_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(extras_bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsaplingprover_createBuilder(this.__wbg_ptr, ptr0, len0, ptr1, len1, target_height);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmTxBuilder.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} spend_params_bytes
     * @param {Uint8Array} output_params_bytes
     */
    constructor(spend_params_bytes, output_params_bytes) {
        const ptr0 = passArray8ToWasm0(spend_params_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(output_params_bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsaplingprover_new(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        WasmSaplingProverFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) WasmSaplingProver.prototype[Symbol.dispose] = WasmSaplingProver.prototype.free;

export class WasmSaplingTree {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSaplingTree.prototype);
        obj.__wbg_ptr = ptr;
        WasmSaplingTreeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSaplingTreeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsaplingtree_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} cmu
     */
    append(cmu) {
        const ptr0 = passArray8ToWasm0(cmu, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsaplingtree_append(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} hex_state
     * @returns {WasmSaplingTree}
     */
    static fromHexState(hex_state) {
        const ptr0 = passStringToWasm0(hex_state, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsaplingtree_fromHexState(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSaplingTree.__wrap(ret[0]);
    }
    /**
     * @returns {WasmSaplingWitness}
     */
    witness() {
        const ret = wasm.wasmsaplingtree_witness(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSaplingWitness.__wrap(ret[0]);
    }
}
if (Symbol.dispose) WasmSaplingTree.prototype[Symbol.dispose] = WasmSaplingTree.prototype.free;

export class WasmSaplingWitness {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSaplingWitness.prototype);
        obj.__wbg_ptr = ptr;
        WasmSaplingWitnessFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSaplingWitnessFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsaplingwitness_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} cmu
     */
    append(cmu) {
        const ptr0 = passArray8ToWasm0(cmu, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsaplingwitness_append(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Uint8Array} data
     * @returns {WasmSaplingWitness}
     */
    static fromBytes(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmsaplingwitness_fromBytes(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmSaplingWitness.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    root() {
        const ret = wasm.wasmsaplingwitness_root(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const ret = wasm.wasmsaplingwitness_serialize(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) WasmSaplingWitness.prototype[Symbol.dispose] = WasmSaplingWitness.prototype.free;

export class WasmTxBuilder {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTxBuilder.prototype);
        obj.__wbg_ptr = ptr;
        WasmTxBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTxBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtxbuilder_free(ptr, 0);
    }
    /**
     * @param {string} address
     * @param {number} amount
     */
    addOutput(address, amount) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtxbuilder_addOutput(this.__wbg_ptr, ptr0, len0, amount);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Uint8Array} note_data
     * @param {Uint8Array} witness_data
     * @returns {Uint8Array}
     */
    addSpend(note_data, witness_data) {
        const ptr0 = passArray8ToWasm0(note_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(witness_data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtxbuilder_addSpend(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @returns {Uint8Array}
     */
    get alpha() {
        const ret = wasm.wasmtxbuilder_alpha(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get alphas() {
        const ret = wasm.wasmtxbuilder_alphas(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    build() {
        const ret = wasm.wasmtxbuilder_build(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Uint8Array} spend_auth_sigs
     * @returns {Uint8Array}
     */
    complete(spend_auth_sigs) {
        const ptr0 = passArray8ToWasm0(spend_auth_sigs, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtxbuilder_complete(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @returns {number}
     */
    get numSpends() {
        const ret = wasm.wasmtxbuilder_numSpends(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {Uint8Array}
     */
    get sighash() {
        const ret = wasm.wasmtxbuilder_sighash(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) WasmTxBuilder.prototype[Symbol.dispose] = WasmTxBuilder.prototype.free;

/**
 * @param {Uint8Array} data
 * @returns {any}
 */
export function decode_map(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decode_map(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} entries
 * @returns {Uint8Array}
 */
export function encode_map(entries) {
    const ret = wasm.encode_map(entries);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * @param {number} id
 * @param {number} max_signers
 * @param {number} min_signers
 * @returns {any}
 */
export function frozt_dkg_part1(id, max_signers, min_signers) {
    const ret = wasm.frozt_dkg_part1(id, max_signers, min_signers);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} secret
 * @param {Uint8Array} round1_packages
 * @returns {any}
 */
export function frozt_dkg_part2(secret, round1_packages) {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(round1_packages, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_dkg_part2(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} secret
 * @param {Uint8Array} round1_packages
 * @param {Uint8Array} round2_packages
 * @returns {any}
 */
export function frozt_dkg_part3(secret, round1_packages, round2_packages) {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(round1_packages, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(round2_packages, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_dkg_part3(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} id
 * @returns {Uint8Array}
 */
export function frozt_encode_identifier(id) {
    const ret = wasm.frozt_encode_identifier(id);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * @param {number} identifier
 * @param {number} max_signers
 * @param {number} min_signers
 * @param {Uint8Array | null | undefined} seed
 * @param {number} account_index
 * @returns {any}
 */
export function frozt_key_import_part1(identifier, max_signers, min_signers, seed, account_index) {
    var ptr0 = isLikeNone(seed) ? 0 : passArray8ToWasm0(seed, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_key_import_part1(identifier, max_signers, min_signers, ptr0, len0, account_index);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} secret
 * @param {Uint8Array} round1_packages
 * @param {Uint8Array} round2_packages
 * @param {Uint8Array} expected_vk
 * @returns {any}
 */
export function frozt_key_import_part3(secret, round1_packages, round2_packages, expected_vk) {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(round1_packages, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(round2_packages, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(expected_vk, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_key_import_part3(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {bigint} birthday
 * @returns {any}
 */
export function frozt_keygen_metadata_create(birthday) {
    const ret = wasm.frozt_keygen_metadata_create(birthday);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} extras
 * @param {bigint} birthday
 * @returns {Uint8Array}
 */
export function frozt_keygen_metadata_create_with_extras(extras, birthday) {
    const ptr0 = passArray8ToWasm0(extras, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keygen_metadata_create_with_extras(ptr0, len0, birthday);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} metadata
 * @returns {Uint8Array}
 */
export function frozt_keygen_metadata_hash(metadata) {
    const ptr0 = passArray8ToWasm0(metadata, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keygen_metadata_hash(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} metadata
 * @returns {any}
 */
export function frozt_keygen_metadata_parse(metadata) {
    const ptr0 = passArray8ToWasm0(metadata, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keygen_metadata_parse(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} key_package
 * @returns {number}
 */
export function frozt_keypackage_identifier(key_package) {
    const ptr0 = passArray8ToWasm0(key_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keypackage_identifier(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * @param {Uint8Array} bundle
 * @returns {bigint}
 */
export function frozt_keyshare_bundle_birthday(bundle) {
    const ptr0 = passArray8ToWasm0(bundle, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keyshare_bundle_birthday(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return BigInt.asUintN(64, ret[0]);
}

/**
 * @param {Uint8Array} bundle
 * @returns {Uint8Array}
 */
export function frozt_keyshare_bundle_key_package(bundle) {
    const ptr0 = passArray8ToWasm0(bundle, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keyshare_bundle_key_package(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} key_package
 * @param {Uint8Array} pub_key_package
 * @param {Uint8Array} sapling_extras
 * @param {bigint} birthday
 * @returns {Uint8Array}
 */
export function frozt_keyshare_bundle_pack(key_package, pub_key_package, sapling_extras, birthday) {
    const ptr0 = passArray8ToWasm0(key_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(pub_key_package, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(sapling_extras, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keyshare_bundle_pack(ptr0, len0, ptr1, len1, ptr2, len2, birthday);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * @param {Uint8Array} bundle
 * @returns {Uint8Array}
 */
export function frozt_keyshare_bundle_pub_key_package(bundle) {
    const ptr0 = passArray8ToWasm0(bundle, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keyshare_bundle_pub_key_package(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} bundle
 * @returns {Uint8Array}
 */
export function frozt_keyshare_bundle_sapling_extras(bundle) {
    const ptr0 = passArray8ToWasm0(bundle, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_keyshare_bundle_sapling_extras(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {number} nonce_handle
 */
export function frozt_nonces_free(nonce_handle) {
    wasm.frozt_nonces_free(nonce_handle);
}

/**
 * @param {Uint8Array} pub_key_package
 * @returns {Uint8Array}
 */
export function frozt_pubkeypackage_verifying_key(pub_key_package) {
    const ptr0 = passArray8ToWasm0(pub_key_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_pubkeypackage_verifying_key(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {number} identifier
 * @param {number} max_signers
 * @param {number} min_signers
 * @param {Uint8Array | null} [old_key_package]
 * @param {Uint8Array | null} [old_identifiers]
 * @returns {any}
 */
export function frozt_reshare_part1(identifier, max_signers, min_signers, old_key_package, old_identifiers) {
    var ptr0 = isLikeNone(old_key_package) ? 0 : passArray8ToWasm0(old_key_package, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(old_identifiers) ? 0 : passArray8ToWasm0(old_identifiers, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_reshare_part1(identifier, max_signers, min_signers, ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} secret
 * @param {Uint8Array} round1_packages
 * @param {Uint8Array} round2_packages
 * @param {Uint8Array} expected_vk
 * @returns {any}
 */
export function frozt_reshare_part3(secret, round1_packages, round2_packages, expected_vk) {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(round1_packages, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(round2_packages, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(expected_vk, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_reshare_part3(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} pub_key_package
 * @param {Uint8Array} sapling_extras
 * @returns {Uint8Array}
 */
export function frozt_sapling_build_dfvk(pub_key_package, sapling_extras) {
    const ptr0 = passArray8ToWasm0(pub_key_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(sapling_extras, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sapling_build_dfvk(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * @param {Uint8Array} dfvk_bytes
 * @param {Uint8Array} note_data
 * @param {bigint} position
 * @param {bigint} height
 * @returns {Uint8Array}
 */
export function frozt_sapling_compute_nullifier(dfvk_bytes, note_data, position, height) {
    const ptr0 = passArray8ToWasm0(dfvk_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(note_data, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sapling_compute_nullifier(ptr0, len0, ptr1, len1, position, height);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * @param {Uint8Array} ivk
 * @param {Uint8Array} cmu
 * @param {Uint8Array} ephemeral_key
 * @param {Uint8Array} enc_ciphertext
 * @param {bigint} height
 * @returns {Uint8Array}
 */
export function frozt_sapling_decrypt_note_full(ivk, cmu, ephemeral_key, enc_ciphertext, height) {
    const ptr0 = passArray8ToWasm0(ivk, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(cmu, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(ephemeral_key, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(enc_ciphertext, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sapling_decrypt_note_full(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, height);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * @param {Uint8Array} pub_key_package
 * @param {Uint8Array} sapling_extras
 * @returns {WasmSaplingKeys}
 */
export function frozt_sapling_derive_keys(pub_key_package, sapling_extras) {
    const ptr0 = passArray8ToWasm0(pub_key_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(sapling_extras, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sapling_derive_keys(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmSaplingKeys.__wrap(ret[0]);
}

/**
 * @returns {Uint8Array}
 */
export function frozt_sapling_generate_extras() {
    const ret = wasm.frozt_sapling_generate_extras();
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
}

/**
 * @param {Uint8Array} ivk
 * @param {Uint8Array} cmu
 * @param {Uint8Array} ephemeral_key
 * @param {Uint8Array} ciphertext
 * @param {bigint} height
 * @returns {any}
 */
export function frozt_sapling_try_decrypt_compact(ivk, cmu, ephemeral_key, ciphertext, height) {
    const ptr0 = passArray8ToWasm0(ivk, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(cmu, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(ephemeral_key, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sapling_try_decrypt_compact(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, height);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} signing_package
 * @param {number} nonce_handle
 * @param {Uint8Array} key_package
 * @param {Uint8Array} randomizer
 * @returns {Uint8Array}
 */
export function frozt_sign(signing_package, nonce_handle, key_package, randomizer) {
    const ptr0 = passArray8ToWasm0(signing_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(key_package, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(randomizer, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sign(ptr0, len0, nonce_handle, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * @param {Uint8Array} signing_package
 * @param {Uint8Array} shares
 * @param {Uint8Array} pub_key_package
 * @param {Uint8Array} randomizer
 * @returns {Uint8Array}
 */
export function frozt_sign_aggregate(signing_package, shares, pub_key_package, randomizer) {
    const ptr0 = passArray8ToWasm0(signing_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(shares, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(pub_key_package, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray8ToWasm0(randomizer, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sign_aggregate(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * @param {Uint8Array} key_package
 * @returns {any}
 */
export function frozt_sign_commit(key_package) {
    const ptr0 = passArray8ToWasm0(key_package, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sign_commit(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} message
 * @param {Uint8Array} commitments
 * @param {Uint8Array} pub_key_package
 * @returns {any}
 */
export function frozt_sign_new_package(message, commitments, pub_key_package) {
    const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(commitments, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(pub_key_package, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.frozt_sign_new_package(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}
export function __wbg_Error_83742b46f01ce22d(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg___wbindgen_debug_string_5398f5bb970e0daa(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_is_function_3c846841762788c1(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
}
export function __wbg___wbindgen_is_object_781bc9f159099513(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
}
export function __wbg___wbindgen_is_string_7ef6b97b02428fae(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
}
export function __wbg___wbindgen_is_undefined_52709e72fb9f179c(arg0) {
    const ret = arg0 === undefined;
    return ret;
}
export function __wbg___wbindgen_number_get_34bb9d9dcfa21373(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_throw_6ddd609b62940d55(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg_call_2d781c1f4d5c0ef8() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments); }
export function __wbg_crypto_38df2bab126b63dc(arg0) {
    const ret = arg0.crypto;
    return ret;
}
export function __wbg_from_4bdf88943703fd48(arg0) {
    const ret = Array.from(arg0);
    return ret;
}
export function __wbg_getRandomValues_c44a50d8cfdaebeb() { return handleError(function (arg0, arg1) {
    arg0.getRandomValues(arg1);
}, arguments); }
export function __wbg_get_3ef1eba1850ade27() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments); }
export function __wbg_get_a8ee5c45dabc1b3b(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
}
export function __wbg_length_b3416cf66a5452c8(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_length_ea16607d7b61445b(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_msCrypto_bd5a034af96bcba6(arg0) {
    const ret = arg0.msCrypto;
    return ret;
}
export function __wbg_new_a70fbab9066b301f() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_ab79df5bd7c26067() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_from_slice_22da9388ac046e50(arg0, arg1) {
    const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_new_with_length_825018a1616e9e55(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return ret;
}
export function __wbg_node_84ea875411254db1(arg0) {
    const ret = arg0.node;
    return ret;
}
export function __wbg_process_44c7a14e11e9f69e(arg0) {
    const ret = arg0.process;
    return ret;
}
export function __wbg_prototypesetcall_d62e5099504357e6(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_push_e87b0e732085a946(arg0, arg1) {
    const ret = arg0.push(arg1);
    return ret;
}
export function __wbg_randomFillSync_6c25eac9869eb53c() { return handleError(function (arg0, arg1) {
    arg0.randomFillSync(arg1);
}, arguments); }
export function __wbg_require_b4edbdcf3e2a1ef0() { return handleError(function () {
    const ret = module.require;
    return ret;
}, arguments); }
export function __wbg_set_7eaa4f96924fd6b3() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(arg0, arg1, arg2);
    return ret;
}, arguments); }
export function __wbg_static_accessor_GLOBAL_8adb955bd33fac2f() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_SELF_f207c857566db248() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_WINDOW_bb9f1ba69d61b386() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_subarray_a068d24e39478a8a(arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
    return ret;
}
export function __wbg_versions_276b2795b1c6a219(arg0) {
    const ret = arg0.versions;
    return ret;
}
export function __wbindgen_cast_0000000000000001(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
    const ret = getArrayU8FromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_cast_0000000000000003(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_cast_0000000000000004(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const WasmSaplingKeysFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsaplingkeys_free(ptr >>> 0, 1));
const WasmSaplingProverFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsaplingprover_free(ptr >>> 0, 1));
const WasmSaplingTreeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsaplingtree_free(ptr >>> 0, 1));
const WasmSaplingWitnessFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsaplingwitness_free(ptr >>> 0, 1));
const WasmTxBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtxbuilder_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
