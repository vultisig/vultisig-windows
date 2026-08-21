import {
  decodeKaminoRawTransactions,
  KaminoDecodedTransaction,
  mentionsKaminoVaultProgram,
} from '@vultisig/core-chain/chains/solana/kamino/tx/decode'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

/**
 * What a keysign payload is, as far as Kamino is concerned.
 *
 * `unrelated` is the ordinary case — the payload never mentions the kVaults
 * program and belongs to some other flow entirely.
 */
type KaminoKeysignReading =
  | { unrelated: true }
  | { decoded: KaminoDecodedTransaction }
  | { unreadable: true }

/**
 * Reads a keysign payload as a Kamino transaction.
 *
 * The two questions are deliberately separate. Whether the bytes MENTION the
 * kVaults program is a coarse byte scan that survives anything — a legacy
 * message, a payload this app cannot parse — and whether they DECODE is the
 * structured read. A payload that mentions the program but does not decode is
 * `unreadable`, never `unrelated`: that is the case where describing it as an
 * ordinary Solana transaction would be the dangerous answer, because the
 * screen would say nothing while the signature still authorises everything.
 *
 * The decode itself is the chain package's, and it is offline — this runs on a
 * co-signing device that holds only the relayed bytes.
 */
export const readKaminoKeysignTransaction = (
  payload: KeysignPayload
): KaminoKeysignReading => {
  const signData = payload.signData
  if (signData.case !== 'signSolana') return { unrelated: true }

  const rawTransactions = signData.value.rawTransactions
  if (!rawTransactions.some(mentionsKaminoVaultProgram)) {
    return { unrelated: true }
  }

  const decoded = decodeKaminoRawTransactions(rawTransactions)
  return decoded ? { decoded } : { unreadable: true }
}
