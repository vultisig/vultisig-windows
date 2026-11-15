import { detectBtcAddressType } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/detectBtcAddressType'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'

const headerBases = {
  p2pkhUncompressed: 27,
  p2pkh: 31,
  'p2sh-p2wpkh': 35,
  p2wpkh: 39,
}

type EncodeBitcoinMessageSignatureInput = {
  signature: Pick<KeysignSignature, 'r' | 's' | 'recovery_id'>
  addressType: keyof typeof headerBases
}

const encodeBitcoinMessageSignature = ({
  signature: { r, s, recovery_id },
  addressType,
}: EncodeBitcoinMessageSignatureInput): Uint8Array => {
  if (!recovery_id || !/^(0?[0-3])$/.test(recovery_id)) {
    throw new Error('Invalid Bitcoin message signature recovery ID')
  }
  const scalars = [r, s].map(value => {
    if (!/^[0-9a-f]{1,64}$/i.test(value)) {
      throw new Error('Invalid Bitcoin message signature scalar')
    }
    const scalar = BigInt(`0x${value}`)
    const order = BigInt(
      '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'
    )
    if (scalar === 0n || scalar >= order) {
      throw new Error('Invalid Bitcoin message signature scalar')
    }
    return Buffer.from(value.padStart(64, '0'), 'hex')
  })
  return Buffer.concat([
    Buffer.from([headerBases[addressType] + parseInt(recovery_id, 16)]),
    ...scalars,
  ])
}

type EncodeClaimSignatureInput = {
  signature: KeysignSignature
  bitcoinAddress: string
}

export const encodeClaimSignature = ({
  signature,
  bitcoinAddress,
}: EncodeClaimSignatureInput): string => {
  const addressType = detectBtcAddressType(bitcoinAddress)
  if (addressType !== 'p2pkh' && addressType !== 'p2wpkh') {
    throw new Error('QBTC claims require a P2PKH or P2WPKH Bitcoin address')
  }
  return Buffer.from(
    encodeBitcoinMessageSignature({ signature, addressType })
  ).toString('base64')
}
