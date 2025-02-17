//
//  KeygenVerify.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//


import Foundation
import OSLog

class KeygenVerify: ObservableObject {
    private let logger = Logger(subsystem: "keygen-verify", category: "tss")
    let serverURL: String
    let sessionID: String
    let localPartyID: String
    let keygenCommittee: [String]
    
    init(serverURL: String, sessionID: String, localPartyID: String, keygenCommittee: [String]) {
        self.serverURL = serverURL
        self.sessionID = sessionID
        self.localPartyID = localPartyID
        self.keygenCommittee = keygenCommittee
    }
    
    func markLocalPartyComplete() async {
        let urlString = "\(self.serverURL)/complete/\(self.sessionID)"
        let body = [self.localPartyID]
        do {
            guard let url = URL(string: urlString) else {
                throw TssRuntimeError("invalid url: \(urlString)")
            }
            let jsonData = try JSONEncoder().encode(body)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            let (_, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw TssRuntimeError("invalid response")
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                return
            default:
                throw TssRuntimeError("unexpected status code: \(httpResponse.statusCode)")
            }
        } catch {
            self.logger.error("Failed to mark local party keygen complete, error:\(error)")
        }
    }
    
    func checkCompletedParties() async throws -> Bool {
        let urlString = "\(serverURL)/complete/\(sessionID)"
        let start = Date()
        guard let url = URL(string: urlString) else {
            throw TssRuntimeError("invalid url: \(urlString)")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        repeat{
            do {
                let (data, _) = try await URLSession.shared.data(for: request)
                if  !data.isEmpty  {
                    let decoder = JSONDecoder()
                    let peers = try decoder.decode([String].self, from: data)
                    if Set(self.keygenCommittee).isSubset(of: Set(peers)) {
                        self.logger.info("all parties have completed keygen successfully")
                        return true
                    }
                }
                try await Task.sleep(for: .seconds(1)) // backoff for 1 second
            } catch {
                self.logger.error("Failed to decode response to JSON: \(error)")
            }
            
        } while (Date().timeIntervalSince(start) < 60) // set timeout to 1 minutes
        return false
    }
}
