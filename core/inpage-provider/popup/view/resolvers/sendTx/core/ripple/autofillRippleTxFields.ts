import { RippleTransaction } from './sanitizeRippleDappTx'

type AutofillInput = {
  transaction: RippleTransaction
  fee: bigint
  sequence: bigint
  lastLedgerSequence: bigint
}

/**
 * Fills the mechanical envelope fields WalletCore needs to serialize an XRPL
 * transaction from raw JSON: `Fee`, `Sequence`, and `LastLedgerSequence`.
 *
 * These come from the wallet's own network read (`rippleSpecific`), never from
 * the page — the dApp cannot know the account's live sequence, and letting it
 * pin the fee or ledger window invites replay and fee-drain games. Any value it
 * supplied for these is overwritten. The value-bearing fields (amounts,
 * destination, offer terms) are left exactly as the user approved them.
 *
 * XRPL encodes `Fee` / `Sequence` / `LastLedgerSequence` as strings and
 * unsigned integers respectively; `sequence` and `lastLedgerSequence` are well
 * within the safe-integer range, so `Number` is exact here.
 */
export const autofillRippleTxFields = ({
  transaction,
  fee,
  sequence,
  lastLedgerSequence,
}: AutofillInput): RippleTransaction => ({
  ...transaction,
  Fee: fee.toString(),
  Sequence: Number(sequence),
  LastLedgerSequence: Number(lastLedgerSequence),
})
