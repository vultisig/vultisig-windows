//
//  Vault.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//

struct KeyshareMeta: Codable {
    let publicKey: String
    let keyshare: String
}

struct VaultMeta: Codable {
    let name: String
    let publicKeyECDSA: String
    let publicKeyEdDSA: String
    let hexChainCode: String
    let localPartyID: String
    let resharePrefix: String?
    let keyshares: [KeyshareMeta]
}
