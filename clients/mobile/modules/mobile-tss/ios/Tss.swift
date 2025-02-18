//
//  Tss.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//

import Tss
import ExpoModulesCore
import OSLog

class TssService {
    private let logger = Logger(subsystem: "TssService", category: "tss")
    let localPartyID: String
    let serverURL: String
    let encryptionKeyHex: String
    let sessionID: String
    let sendEvent: (String, [String: Any]) -> Void
    
    init(localPartyID: String,
         serverURL: String,
         encryptionKeyHex: String,
         sessionID: String,
         sendEvent: @escaping (String, [String: Any]) -> Void) {
        self.localPartyID = localPartyID
        self.serverURL = serverURL
        self.encryptionKeyHex = encryptionKeyHex
        self.sessionID = sessionID
        self.sendEvent = sendEvent
    }
    
    private let tssMessenger: TssMessengerProtocol? = nil
    private let localStateAccessor: LocalStateAccessorImpl? = nil
    
    private func createTssInstance(messenger: TssMessengerImpl,
                                   stateAccessor: LocalStateAccessorImpl,
                                   generatePrime: Bool) async throws -> TssServiceImpl? {
        var err: NSError?
        let service = TssNewService(messenger,stateAccessor, generatePrime, &err)
        if let err {
            throw err
        }
        return service
    }
    
    func Keygen(tssService: TssServiceImpl,
                hexChainCode: String,
                keygenCommittee: [String],
                isEncryptGCM: Bool,
                attempt: Int = 0) async throws -> String {
        let messagePuller = MessagePuller(encryptGCM: isEncryptGCM)
        do{
            messagePuller.pollMessages(serverURL: self.serverURL, sessionID: self.sessionID, localPartyKey: self.localPartyID, encryptionKeyHex: self.encryptionKeyHex, tssService: tssService, messageID: nil)
            let keygenReq = TssKeygenRequest()
            keygenReq.localPartyID = self.localPartyID
            keygenReq.allParties = keygenCommittee.joined(separator: ",")
            keygenReq.chainCodeHex = hexChainCode
            self.logger.info("chaincode:\(hexChainCode)")
            self.sendEvent("onKeygen",["current":"ECDSA"])
            let keygenRespECDSA = try tssService.keygenECDSA(keygenReq)
            
            try await Task.sleep(for: .seconds(1)) // Sleep one sec to allow other parties to get in the same step
            self.sendEvent("onKeygen",["current":"EdDSA"])
            let keygenRespEdDSA = try tssService.keygenEdDSA(keygenReq)
            
            let keygenVerify = KeygenVerify(serverURL: self.serverURL,
                                            sessionID: self.sessionID,
                                            localPartyID: self.localPartyID,
                                            keygenCommittee: keygenCommittee)
            await keygenVerify.markLocalPartyCompleteWithRetry()
            let allFinished = try await keygenVerify.checkCompletedParties()
            if !allFinished {
                throw TssRuntimeError("partial vault created, not all parties finished successfully")
            }
            // return from here
        } catch {
            messagePuller.stop()
            self.logger.error("fail to generate key,error: \(error.localizedDescription)")
            if attempt < 3 {
                return try await self.Keygen(tssService: tssService, hexChainCode: hexChainCode, keygenCommittee: keygenCommittee, isEncryptGCM: isEncryptGCM, attempt: attempt + 1)
            } else {
                throw error
            }
        }
        return ""
    }
    
    func waitingForKeygenStart() {
        
    }
    
    func KeygenWithRetry(hexChainCode: String) async throws -> String {
        
        let keygenCommittee: [String] = []
        let isEncryptGCM = await FeatureFlagService().isFeatureEnabled(feature: .EncryptGCM)
        let messengerImpl = TssMessengerImpl(serverURL: self.serverURL, sessionID: self.sessionID, messageID: nil, encryptionKeyHex: self.encryptionKeyHex, encryptGCM: isEncryptGCM)
        let stateAccessorImpl = LocalStateAccessorImpl()
        self.sendEvent("onKeygen",["current":"PrepareVault"])
        // this might take a while
        guard let tssService = try await createTssInstance(messenger: messengerImpl, stateAccessor: stateAccessorImpl,generatePrime: true) else {
            throw TssRuntimeError("Failed to create TssService instance")
        }
        return try await self.Keygen(tssService: tssService, hexChainCode: hexChainCode, keygenCommittee: keygenCommittee,isEncryptGCM: isEncryptGCM,attempt: 0)
    }
}
