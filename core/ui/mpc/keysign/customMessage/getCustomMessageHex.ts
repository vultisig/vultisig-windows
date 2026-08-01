import { sha512 } from '@noble/hashes/sha2.js'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { getSuiPersonalMessageDigest } from '@vultisig/core-chain/chains/sui/sign'
import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { match } from '@vultisig/lib-utils/match'
import { omit } from '@vultisig/lib-utils/record/omit'
import { TypedDataEncoder } from 'ethers'
import { keccak256, sha256 } from 'viem'

import { CustomMessageSupportedChain } from './chains'

type GetCustomMessageHexInput = {
  chain: CustomMessageSupportedChain
  message: string
  method: string
}

// Sui custom messages are personal messages only — built Sui transactions go
// through the standard keysign pipeline (`signSui` keysign payload), not here.
// `getSuiPersonalMessageDigest` handles the BCS `vector<u8>` wrap and the
// PersonalMessage intent.
const getSuiDigestHex = ({ message }: { message: string }): string => {
  const messageBytes = message.startsWith('0x')
    ? Buffer.from(stripHexPrefix(message), 'hex')
    : new TextEncoder().encode(message)
  return Buffer.from(getSuiPersonalMessageDigest(messageBytes)).toString('hex')
}

export const getCustomMessageHex = ({
  chain,
  message,
  method,
}: GetCustomMessageHexInput) => {
  if (method === 'eth_signTypedData_v4') {
    const { domain, types, message: msg } = JSON.parse(message)
    return stripHexPrefix(
      TypedDataEncoder.hash(domain, omit(types, 'EIP712Domain'), msg)
    )
  }

  const bytes = message.startsWith('0x')
    ? Buffer.from(stripHexPrefix(message), 'hex')
    : new TextEncoder().encode(message)

  return match(getChainKind(chain), {
    evm: () => stripHexPrefix(keccak256(bytes)),
    // ADR-36 (Keplr signArbitrary): `message` carries the canonical
    // StdSignDoc{MsgSignData} bytes; the signed digest is their sha256.
    cosmos: () => stripHexPrefix(sha256(bytes)),
    solana: () => Buffer.from(bytes).toString('hex'),
    sui: () => getSuiDigestHex({ message }),
    ton: () => Buffer.from(bytes).toString('hex'),
    tron: () => stripHexPrefix(keccak256(bytes)),
    polkadot: () => Buffer.from(bytes).toString('hex'),
    cardano: () => Buffer.from(bytes).toString('hex'),
    // XRPL (GemWallet signMessage / ripple-keypairs): the signed digest is
    // SHA-512-half — the first 32 bytes of SHA-512 — of the message bytes.
    ripple: () => Buffer.from(sha512(bytes).slice(0, 32)).toString('hex'),
  })
}
