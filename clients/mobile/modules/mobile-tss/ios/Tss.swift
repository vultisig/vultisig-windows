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
    let name: String
    let localPartyID: String
    let serverURL: String
    let encryptionKeyHex: String
    let sessionID: String
    let sendEvent: (String, [String: Any]) -> Void
    
    init(name: String,
         localPartyID: String,
         serverURL: String,
         encryptionKeyHex: String,
         sessionID: String,
         sendEvent: @escaping (String, [String: Any]) -> Void) {
        self.name = name
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
                stateAccessor: LocalStateAccessorImpl,
                hexChainCode: String,
                keygenCommittee: [String],
                isEncryptGCM: Bool,
                attempt: Int = 0) async throws -> VaultMeta? {
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
            let ecdsaKeyshare = stateAccessor.getLocalState(keygenRespECDSA.pubKey, error: nil)
            let eddsaKeyshare = stateAccessor.getLocalState(keygenRespEdDSA.pubKey, error: nil)
            let vaultMeta = VaultMeta(name: self.name,
                                      publicKeyECDSA: keygenRespECDSA.pubKey,
                                      publicKeyEdDSA: keygenRespEdDSA.pubKey,
                                      hexChainCode: hexChainCode,
                                      localPartyID: self.localPartyID,
                                      resharePrefix: nil,
                                      keyshares: [KeyshareMeta(publicKey: keygenRespECDSA.pubKey, keyshare: ecdsaKeyshare),
                                                  KeyshareMeta(publicKey: keygenRespEdDSA.pubKey, keyshare: eddsaKeyshare)])
            return vaultMeta
        } catch {
            messagePuller.stop()
            self.logger.error("fail to generate key,error: \(error.localizedDescription)")
            if attempt < 3 {
                return try await self.Keygen(tssService: tssService,
                                             stateAccessor: stateAccessor,
                                             hexChainCode: hexChainCode,
                                             keygenCommittee: keygenCommittee,
                                             isEncryptGCM: isEncryptGCM,
                                             attempt: attempt + 1)
            } else {
                throw error
            }
        }
    }
    
    // wait for keygen to kick off for a minute
    func waitingForKeygenStart() async throws ->[String] {
        let urlString = self.serverURL + "/start/" + self.sessionID
        let start = Date()
        guard let url = URL(string: urlString) else {
            throw TssRuntimeError("invalid URL: \(urlString)")
        }
        var uniquePeers = Set<String>()
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        repeat {
            do {
                let (data, _) = try await URLSession.shared.data(for: request)
                if  !data.isEmpty  {
                    let decoder = JSONDecoder()
                    let peers = try decoder.decode([String].self, from: data)
                    uniquePeers.formUnion(peers)
                }
                try await Task.sleep(for: .seconds(1)) // backoff for 1 second
            } catch {
                self.logger.error("Failed to decode response to JSON: \(error)")
            }
        } while (Date().timeIntervalSince(start) < 60) // let's wait for keygen to start for 60 second
        return Array(uniquePeers)
    }
    // doing keygen with retry
    func KeygenWithRetry(hexChainCode: String) async throws -> VaultMeta? {
        let keygenCommittee: [String] = try await self.waitingForKeygenStart()
        let isEncryptGCM = await FeatureFlagService().isFeatureEnabled(feature: .EncryptGCM)
        let messengerImpl = TssMessengerImpl(serverURL: self.serverURL, sessionID: self.sessionID, messageID: nil, encryptionKeyHex: self.encryptionKeyHex, encryptGCM: isEncryptGCM)
        let stateAccessorImpl = LocalStateAccessorImpl()
        self.sendEvent("onKeygen",["current":"PrepareVault"])
        // this might take a while
        guard let tssService = try await createTssInstance(messenger: messengerImpl, stateAccessor: stateAccessorImpl,generatePrime: true) else {
            throw TssRuntimeError("Failed to create TssService instance")
        }
        return try await self.Keygen(tssService: tssService,stateAccessor: stateAccessorImpl, hexChainCode: hexChainCode, keygenCommittee: keygenCommittee,isEncryptGCM: isEncryptGCM,attempt: 0)
    }
}
