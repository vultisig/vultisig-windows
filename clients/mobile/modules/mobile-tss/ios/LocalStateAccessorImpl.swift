//
//  LocalStateAccessorImp.swift
//  VultisigApp
//

import Foundation
import Tss

final class LocalStateAccessorImpl: NSObject, TssLocalStateAccessorProtocol, ObservableObject {
    struct RuntimeError: LocalizedError {
        let description: String
        init(_ description: String) {
            self.description = description
        }
        
        var errorDescription: String? {
            self.description
        }
    }
    
    private var localStateDict: [String: String] = [:]
    
    func getLocalState(_ pubKey: String?, error: NSErrorPointer) -> String {
        guard let pubKey else {
            return ""
        }
        
        return localStateDict[pubKey] ?? ""
    }
    
    func saveLocalState(_ pubkey: String?, localState: String?) throws {
        guard let pubkey else {
            throw RuntimeError("pubkey is nil")
        }
        guard let localState else {
            throw RuntimeError("localstate is nil")
        }
        localStateDict[pubkey] = localState
    }
}

