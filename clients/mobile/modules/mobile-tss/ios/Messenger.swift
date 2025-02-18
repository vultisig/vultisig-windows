//
//  Messenger.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//

import Tss
import OSLog

final class TssMessengerImpl: NSObject, TssMessengerProtocol {
    let serverURL: String
    let sessionID: String
    let messageID: String?
    let encryptionKeyHex: String
    let encryptGCM: Bool
    var counter: Int64 = 1
    private let logger = Logger(subsystem: "messenger", category: "tss")
    init(serverURL: String, sessionID: String, messageID: String?, encryptionKeyHex: String, encryptGCM: Bool) {
        self.serverURL = serverURL
        self.sessionID = sessionID
        self.messageID = messageID
        self.encryptionKeyHex = encryptionKeyHex
        self.encryptGCM = encryptGCM
        self.counter = 1
    }
    
    func send(_ fromParty: String?, to: String?, body: String?) throws {
        guard let fromParty else {
            logger.error("from is nil")
            return
        }
        guard let to else {
            logger.error("to is nil")
            return
        }
        guard let body else {
            logger.error("body is nil")
            return
        }
        let urlString = "\(self.serverURL)/message/\(self.sessionID)"
        let url = URL(string: urlString)
        guard let url else {
            logger.error("URL can't be construct from: \(urlString)")
            return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.addValue("application/json", forHTTPHeaderField: "Content-Type")
        if let messageID = self.messageID {
            req.setValue(messageID, forHTTPHeaderField: "message_id")
        }
        
        var encryptedBody: String? = nil
        if self.encryptGCM {
            print("decrypt with AES+GCM")
            encryptedBody = body.aesEncryptGCM(key: self.encryptionKeyHex)
        } else {
            print("decrypt with AES+CBC")
            encryptedBody = body.aesEncrypt(key: self.encryptionKeyHex)
        }
        guard let encryptedBody else {
            logger.error("fail to encrypt message body")
            return
        }
        let msg = Message(session_id: sessionID,
                          from: fromParty,
                          to: [to],
                          body: encryptedBody,
                          hash: Utils.getMD5Hash(msg: body),
                          sequenceNo: self.counter)
        self.counter += 1
        do {
            let jsonEncode = JSONEncoder()
            let encodedBody = try jsonEncode.encode(msg)
            req.httpBody = encodedBody
        } catch {
            logger.error("fail to encode body into json string,\(error)")
            return
        }
        let retry = 3
        self.sendWithRetry(req: req, msg: msg, retry: retry)
    }
    
    func sendWithRetry(req: URLRequest, msg: Message, retry: Int) {
        URLSession.shared.dataTask(with: req) { _, resp, err in
            if let err {
                self.logger.error("fail to send message,error:\(err)")
                if retry == 0 {
                    return
                } else {
                    self.sendWithRetry(req: req, msg: msg, retry: retry - 1)
                }
            }
            guard let resp = resp as? HTTPURLResponse, (200 ... 299).contains(resp.statusCode) else {
                self.logger.error("invalid response code")
                return
            }
            self.logger.debug("send message (\(msg.hash) to (\(msg.to)) successfully")
        }.resume()
    }
}
