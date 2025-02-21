//
//  LocalStateAccessorImp.swift
//  VultisigApp
//

import Foundation
import Tss

struct TssRuntimeError: LocalizedError {
    let description: String
    init(_ description: String) {
        self.description = description
    }
    
    var errorDescription: String? {
        self.description
    }
}

final class LocalStateAccessorImpl: NSObject, TssLocalStateAccessorProtocol, ObservableObject {
    var localStateDict: [String: String]
    init(localStateDict: [String : String]? = nil) {
        if let localStateDict = localStateDict {
            self.localStateDict = Dictionary(uniqueKeysWithValues: localStateDict.map { ($0.key, $0.value) })
        } else {
            self.localStateDict = [:]
        }
    }
    
    func getLocalState(_ pubKey: String?, error: NSErrorPointer) -> String {
        guard let pubKey else {
            return ""
        }
        
        return localStateDict[pubKey] ?? ""
    }
    
    func saveLocalState(_ pubkey: String?, localState: String?) throws {
        guard let pubkey else {
            throw TssRuntimeError("pubkey is nil")
        }
        guard let localState else {
            throw TssRuntimeError("localstate is nil")
        }
        localStateDict[pubkey] = localState
    }
}

