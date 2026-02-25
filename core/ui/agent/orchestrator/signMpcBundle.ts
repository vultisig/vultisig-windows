import { EvmChain } from '@core/chain/Chain'
import { getEvmChainByChainId } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { numberToHex } from '@lib/utils/hex/numberToHex'
import { fromRlp, type Hex, keccak256, toRlp } from 'viem'

import { fastVaultKeysign } from '../tools/shared/fastVaultKeysign'
import type { VaultMeta } from '../tools/types'
import type { MpcTransaction } from './types'

function ensureHex(hex: string): Hex {
  return (hex.startsWith('0x') ? hex : `0x${hex}`) as Hex
}

// Strip leading zero bytes so RLP encodes canonical big.Int values.
// "0x00abc" → "0xabc", "0x00" → "0x", "0x0100" → "0x0100" (no change)
function canonicalHexInt(hex: Hex): Hex {
  const stripped = hex.slice(2).replace(/^0+/, '')
  return `0x${stripped}` as Hex
}

export function resolveEvmChainFromTx(tx: MpcTransaction): EvmChain {
  let hexChainId = tx.chain_id
  if (!hexChainId.startsWith('0x')) {
    hexChainId = numberToHex(parseInt(hexChainId, 10))
  }
  const evmChain = getEvmChainByChainId(hexChainId)
  if (!evmChain) {
    throw new Error(`Unsupported EVM chain_id: ${tx.chain_id}`)
  }
  return evmChain
}

function compileSignedEvmTx(
  unsignedTxHex: string,
  r: string,
  s: string,
  recoveryId: number
): Hex {
  const raw = ensureHex(unsignedTxHex)
  const firstByte = parseInt(raw.slice(2, 4), 16)

  const rHex = canonicalHexInt(ensureHex(r))
  const sHex = canonicalHexInt(ensureHex(s))

  // Typed transaction (EIP-2930=0x01, EIP-1559=0x02, etc.)
  if (firstByte < 0x80) {
    const typeByte = raw.slice(2, 4)
    const rlpPayload = `0x${raw.slice(4)}` as Hex
    const fields = fromRlp(rlpPayload, 'hex') as Hex[]

    const v = canonicalHexInt(
      `0x${recoveryId.toString(16)}` as Hex
    )
    const signedFields = [...fields, v, rHex, sHex]
    const signedRlp = toRlp(signedFields, 'hex')
    return `0x${typeByte}${signedRlp.slice(2)}` as Hex
  }

  // Legacy transaction: [nonce, gasPrice, gasLimit, to, value, data, chainId, 0, 0]
  const fields = fromRlp(raw, 'hex') as Hex[]
  const chainIdHex = fields[6]
  const chainIdNum =
    !chainIdHex || chainIdHex === '0x' || chainIdHex === '0x0'
      ? 0n
      : BigInt(chainIdHex)

  const v = chainIdNum * 2n + 35n + BigInt(recoveryId)
  const vHex = canonicalHexInt(`0x${v.toString(16)}` as Hex)

  const signedFields = [...fields.slice(0, 6), vHex, rHex, sHex]
  return toRlp(signedFields, 'hex')
}

export async function signAndBroadcastMpcTransaction(
  tx: MpcTransaction,
  vault: VaultMeta
): Promise<string> {
  const evmChain = resolveEvmChainFromTx(tx)

  const unsignedBytes = ensureHex(tx.unsigned_tx_hex)
  const signingHash = keccak256(unsignedBytes)
  const messageHash = signingHash.slice(2)

  const sig = await fastVaultKeysign({
    vault,
    messageHash,
    derivePath: "m/44'/60'/0'/0/0",
    signatureAlgorithm: 'ecdsa',
    chain: evmChain,
  })

  if (!sig.recovery_id) {
    throw new Error('MPC signature missing recovery_id')
  }

  const recoveryId = parseInt(sig.recovery_id, 16)

  const signedTxHex = compileSignedEvmTx(
    tx.unsigned_tx_hex,
    sig.r,
    sig.s,
    recoveryId
  )

  const client = getEvmClient(evmChain)
  const txHash = await client.sendRawTransaction({
    serializedTransaction: signedTxHex,
  })

  return txHash
}
