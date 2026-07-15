import { attempt } from '@vultisig/lib-utils/attempt'

/**
 * XRPL transaction types this wallet will sign for a dApp. A swap is an
 * `OfferCreate` (optionally paired with `OfferCancel`); `Payment` and
 * `TrustSet` round out the common surface. Anything outside this set —
 * `AccountSet`, `SetRegularKey`, `SignerListSet`, hooks — is refused so a
 * dApp cannot slip a key-rotation or account-takeover past a user who thinks
 * they are approving a trade. Extend deliberately.
 */
const allowedRippleTransactionTypes = [
  'Payment',
  'OfferCreate',
  'OfferCancel',
  'TrustSet',
] as const

export type RippleTransaction = Record<string, unknown> & {
  TransactionType: string
  Account: string
}

/**
 * Signing-mechanics fields a dApp has no business setting on an unsigned
 * request: `SigningPubKey` is filled from the vault key at signing time,
 * `TxnSignature` is the signature we are about to produce, and `Signers` is a
 * multi-sign envelope irrelevant to single-sig MPC. Unlike `Account` (below)
 * there is no legitimate value to check them against, so they are dropped
 * outright rather than validated.
 */
const strippedFields = ['SigningPubKey', 'TxnSignature', 'Signers']

type SanitizeInput = {
  rawJson: string
  accountAddress: string
}

/**
 * Validates a dApp-supplied XRPL transaction and pins it to the active vault.
 *
 * Rejects anything that isn't a JSON object with an allowlisted
 * `TransactionType`, and drops the signing-mechanics fields. `Account` is
 * validated rather than silently rewritten: absent means "wallet fills the
 * sender" (GemWallet's model), a match is fine, and a *different* address is
 * refused — signing it as our vault would change who the transaction is from
 * out from under the user. The result is signed verbatim, so this is the only
 * gate between the page and the signer; it fails loudly rather than coercing a
 * malformed request into something signable.
 */
export const sanitizeRippleDappTx = ({
  rawJson,
  accountAddress,
}: SanitizeInput): RippleTransaction => {
  const parsed = attempt(() => JSON.parse(rawJson) as unknown)
  if ('error' in parsed) {
    throw new Error('Ripple transaction is not valid JSON')
  }

  const tx = parsed.data
  if (typeof tx !== 'object' || tx === null || Array.isArray(tx)) {
    throw new Error('Ripple transaction must be a JSON object')
  }

  const record = tx as Record<string, unknown>
  const transactionType = record.TransactionType

  if (typeof transactionType !== 'string') {
    throw new Error('Ripple transaction is missing a TransactionType')
  }

  if (
    !allowedRippleTransactionTypes.includes(
      transactionType as (typeof allowedRippleTransactionTypes)[number]
    )
  ) {
    throw new Error(
      `Ripple transaction type ${transactionType} is not supported`
    )
  }

  // A page that names a sender other than the connected vault is trying to get
  // us to sign a transaction that claims to be from someone else. Refuse it —
  // don't quietly substitute our own address.
  if (record.Account !== undefined && record.Account !== accountAddress) {
    throw new Error(
      'Ripple transaction Account does not match the connected account'
    )
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) {
    if (!strippedFields.includes(key)) {
      sanitized[key] = value
    }
  }

  return {
    ...sanitized,
    TransactionType: transactionType,
    Account: accountAddress,
  }
}
