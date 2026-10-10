type TonProofItemReply = {
  name: 'ton_proof'
  proof: {
    timestamp: number
    domain: {
      lengthBytes: number
      value: string
    }
    payload: string
    signature: string
  }
}

type FormatTonProofReplyInput = {
  signatureHex: string
  timestamp: number
  domain: string
  payload: string
}

/** Formats the TonProofItemReply for the TonConnect connect response. */
export const formatTonProofReply = ({
  signatureHex,
  timestamp,
  domain,
  payload,
}: FormatTonProofReplyInput): TonProofItemReply => ({
  name: 'ton_proof',
  proof: {
    timestamp,
    domain: {
      lengthBytes: Buffer.from(domain, 'utf-8').length,
      value: domain,
    },
    payload,
    signature: Buffer.from(signatureHex, 'hex').toString('base64'),
  },
})
