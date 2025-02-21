//
//  Message.swift
//  Pods
//
//  Created by Johnny Luo on 17/2/2025.
//

struct Message: Codable {
    let session_id: String
    let from: String
    let to: [String]
    let body: String
    let hash: String
    let sequence_no: Int64
    
    init(session_id: String,
         from: String,
         to: [String],
         body: String,
         hash: String,
         sequenceNo: Int64) {
        self.session_id = session_id
        self.from = from
        self.to = to
        self.body = body
        self.hash = hash
        self.sequence_no = sequenceNo
    }
}
