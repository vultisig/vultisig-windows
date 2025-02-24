//
//  MessagePuller.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//


import Foundation
import OSLog
import Tss

class MessagePuller {
    var cache = NSCache<NSString, AnyObject>()
    private var pollingInboundMessages = true
    private let logger = Logger(subsystem: "message-puller", category: "communication")
    private var currentTask: Task<Void,Error>? = nil
    let encryptGCM: Bool
    
    init(encryptGCM: Bool){
        self.encryptGCM = encryptGCM
    }
    
    func stop() {
        pollingInboundMessages = false
        cache.removeAllObjects()
        currentTask?.cancel()
    }
    
    func pollMessages(serverURL: String,
                      sessionID: String,
                      localPartyKey: String,
                      encryptionKeyHex: String,
                      tssService: TssServiceImpl,
                      messageID: String?)
    {
        pollingInboundMessages = true
        currentTask = Task.detached {
            repeat {
                if Task.isCancelled {
                    print("stop pulling for messageid:\(messageID ?? "")")
                    return
                }
                print("pulling for messageid:\(messageID ?? "")")
                try await self.pollInboundMessages(serverURL: serverURL,
                                                   sessionID: sessionID,
                                                   localPartyKey: localPartyKey,
                                                   encryptionKeyHex: encryptionKeyHex,
                                                   tssService: tssService,
                                                   messageID: messageID)
                try await Task.sleep(for: .seconds(1)) // Back off 1s
            } while self.pollingInboundMessages
        }
    }
    
    func getHeaders(messageID: String?) -> [String:String]{
        var header = [String: String]()
        if let messageID {
            header["message_id"] = messageID
        }
        return header
    }
    
    private func pollInboundMessages(serverURL: String,
                                     sessionID: String,
                                     localPartyKey: String,
                                     encryptionKeyHex: String,
                                     tssService: TssServiceImpl, messageID: String?) async throws {
        let urlString = "\(serverURL)/message/\(sessionID)/\(localPartyKey)"
        guard let url = URL(string: urlString) else {
            throw TssRuntimeError("invalid URL: \(urlString)")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let headers = getHeaders(messageID: messageID)
        for item in headers {
            request.setValue(item.value, forHTTPHeaderField: item.key)
        }
        
        let (data,resp) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = resp as? HTTPURLResponse else {
            throw TssRuntimeError("invalid http response")
        }
        
        if httpResponse.statusCode < 200 || httpResponse.statusCode >= 300 {
            throw TssRuntimeError("invalid response code: \(httpResponse.statusCode)")
        }
        
        print("Response: \(String(data:data,encoding: .utf8) ?? "")")
        let decoder = JSONDecoder()
        let msgs = try decoder.decode([Message].self, from: data)
        let sortedMsgs = msgs.sorted(by: { $0.sequence_no < $1.sequence_no })
        for msg in sortedMsgs {
            var key = "\(sessionID)-\(localPartyKey)-\(msg.hash)" as NSString
            if let messageID {
                key = "\(sessionID)-\(localPartyKey)-\(messageID)-\(msg.hash)" as NSString
            }
            if self.cache.object(forKey: key) != nil {
                self.logger.info("message with key:\(key) has been applied before")
                // message has been applied before
                continue
            }
            self.logger.debug("Got message from: \(msg.from), to: \(msg.to), key:\(key)")
            var decryptedBody: String? = nil
            if self.encryptGCM {
                print("decrypt with AES+GCM")
                decryptedBody = msg.body.aesDecryptGCM(key: encryptionKeyHex)
            }else{
                print("decrypt with AES+CBC")
                decryptedBody = msg.body.aesDecrypt(key: encryptionKeyHex)
            }
            try tssService.applyData(decryptedBody)
            self.cache.setObject(NSObject(), forKey: key)
            
            // delete it from a task, since we don't really care about the result
            await self.deleteMessageFromServer(serverURL: serverURL,
                                               sessionID: sessionID,
                                               localPartyKey: localPartyKey,
                                               hash: msg.hash,
                                               headers: self.getHeaders(messageID: messageID))
            
        }
    }
    
    private func deleteMessageFromServer(
        serverURL: String,
        sessionID: String,
        localPartyKey: String,
        hash: String,
        headers: [String:String]
    ) async {
        let urlString = "\(serverURL)/message/\(sessionID)/\(localPartyKey)/\(hash)"
        guard let url = URL(string: urlString) else {
            logger.error("URL can't be constructed from: \(urlString)")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        for item in headers {
            request.setValue(item.value, forHTTPHeaderField: item.key)
        }
        do{
            let (_,_) = try await URLSession.shared.data(for: request)
        }
        catch {
            logger.error("Error deleting message from server: \(error)")
        }
    }
}
