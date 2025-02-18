//
//  Utils.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//
import CryptoKit

enum Utils {
    public static func getMD5Hash(msg: String) -> String {
        let digest = Insecure.MD5.hash(data: Data(msg.utf8))
        return digest.map {
            String(format: "%02hhx", $0)
        }.joined()
    }
}
