import { Buffer } from 'buffer'

/**
 * Builders that turn the GemWallet convenience-method payloads
 * (`sendPayment` / `setTrustline` / `createOffer` / `cancelOffer`) into the XRPL
 * transaction JSON our submit path already handles. The output is signed
 * verbatim by WalletCore (see the ripple keysign resolver), so amounts and memos
 * are encoded here exactly as XRPL expects; the popup fills `Account`, `Fee`,
 * `Sequence`, and `LastLedgerSequence`, so those are deliberately not set.
 *
 * Mirrors GemWallet's own `buildXRPLTransaction` field mapping so a dApp gets
 * the same transaction whichever wallet it targets.
 */

/** An XRPL amount: a drops string for XRP, or an issued-currency object. */
type XrplAmount = string | { currency: string; issuer: string; value: string }

/** Fields common to every GemWallet transaction request that we forward. */
type CommonRequest = {
  memos?: {
    memo: { memoType?: string; memoData?: string; memoFormat?: string }
  }[]
  sourceTag?: number
  accountTxnID?: string
  ticketSequence?: number
  networkID?: number
}

/** GemWallet `sendPayment` payload, mapped to an XRPL `Payment`. */
export type SendPaymentRequest = CommonRequest & {
  amount: XrplAmount
  destination: string
  destinationTag?: number
  invoiceID?: string
  paths?: unknown
  sendMax?: XrplAmount
  deliverMin?: XrplAmount
  flags?: number | Record<string, boolean>
}

/** GemWallet `setTrustline` payload, mapped to an XRPL `TrustSet`. */
export type SetTrustlineRequest = CommonRequest & {
  limitAmount: { currency: string; issuer: string; value: string }
  qualityIn?: number
  qualityOut?: number
  flags?: number | Record<string, boolean>
}

/** GemWallet `createOffer` payload, mapped to an XRPL `OfferCreate`. */
export type CreateOfferRequest = CommonRequest & {
  takerGets: XrplAmount
  takerPays: XrplAmount
  expiration?: number
  offerSequence?: number
  flags?: number | Record<string, boolean>
}

/** GemWallet `cancelOffer` payload, mapped to an XRPL `OfferCancel`. */
export type CancelOfferRequest = CommonRequest & {
  offerSequence: number
}

const standardCurrencyCodeLength = 3
const hexCurrencyCodeLength = 40

/**
 * XRPL accepts a 3-character currency code as-is but requires any longer code
 * (e.g. `SOLO`, `RLUSD`) as a 40-character hex string. An existing 40-char hex
 * code is left untouched.
 */
const toXrplCurrencyCode = (currency: string): string =>
  currency.length > standardCurrencyCodeLength &&
  currency.length !== hexCurrencyCodeLength
    ? Buffer.from(currency)
        .toString('hex')
        .toUpperCase()
        .padEnd(hexCurrencyCodeLength, '0')
    : currency

const normalizeAmount = (amount: XrplAmount): XrplAmount =>
  typeof amount === 'string'
    ? amount
    : { ...amount, currency: toXrplCurrencyCode(amount.currency) }

// ---- payload validation (unknown wire input -> typed value) ----

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asRecord = (
  payload: unknown,
  method: string
): Record<string, unknown> => {
  if (!isRecord(payload)) {
    throw new Error(`XRPL ${method} payload must be an object`)
  }
  return payload
}

const requireString = (
  record: Record<string, unknown>,
  key: string,
  method: string
): string => {
  const value = record[key]
  if (typeof value !== 'string' || value === '') {
    throw new Error(`XRPL ${method} is missing "${key}"`)
  }
  return value
}

const requireInteger = (
  record: Record<string, unknown>,
  key: string,
  method: string
): number => {
  const value = record[key]
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`XRPL ${method} is missing a numeric "${key}"`)
  }
  return value
}

const requireAmount = (
  value: unknown,
  method: string,
  { tokenOnly = false }: { tokenOnly?: boolean } = {}
): XrplAmount => {
  if (!tokenOnly && typeof value === 'string' && value !== '') return value
  if (isRecord(value)) {
    const { currency, issuer, value: tokenValue } = value
    if (
      typeof currency === 'string' &&
      typeof issuer === 'string' &&
      typeof tokenValue === 'string'
    ) {
      return { currency, issuer, value: tokenValue }
    }
  }
  throw new Error(`XRPL ${method} amount is malformed`)
}

/** Forwards `record[from]` to `tx[to]` verbatim when the dApp supplied it. */
const forward = (
  tx: Record<string, unknown>,
  record: Record<string, unknown>,
  from: string,
  to: string
): void => {
  if (record[from] !== undefined) tx[to] = record[from]
}

/** Maps the GemWallet `memos` array (if any) onto the XRPL `Memos` field. */
const applyMemos = (
  tx: Record<string, unknown>,
  record: Record<string, unknown>
): void => {
  const { memos } = record
  if (!Array.isArray(memos)) return
  tx.Memos = memos.map(entry => {
    const memo = isRecord(entry) && isRecord(entry.memo) ? entry.memo : {}
    return {
      Memo: {
        ...(typeof memo.memoType === 'string'
          ? { MemoType: memo.memoType }
          : {}),
        ...(typeof memo.memoData === 'string'
          ? { MemoData: memo.memoData }
          : {}),
        ...(typeof memo.memoFormat === 'string'
          ? { MemoFormat: memo.memoFormat }
          : {}),
      },
    }
  })
}

/**
 * Applies the common fields the wallet doesn't own. `Account` is filled by the
 * popup sanitizer and `Fee` / `Sequence` / `LastLedgerSequence` are autofilled
 * from the wallet's own network read, so they're deliberately not forwarded.
 */
const applyCommonFields = (
  tx: Record<string, unknown>,
  record: Record<string, unknown>
): void => {
  applyMemos(tx, record)
  forward(tx, record, 'sourceTag', 'SourceTag')
  forward(tx, record, 'accountTxnID', 'AccountTxnID')
  forward(tx, record, 'ticketSequence', 'TicketSequence')
  forward(tx, record, 'networkID', 'NetworkID')
}

// ---- builders (unknown wire payload -> XRPL transaction JSON) ----

/** Builds an XRPL `Payment` from a GemWallet `sendPayment` payload. */
export const buildPaymentTx = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload, 'sendPayment')
  const tx: Record<string, unknown> = {
    TransactionType: 'Payment',
    Destination: requireString(record, 'destination', 'sendPayment'),
    Amount: normalizeAmount(requireAmount(record.amount, 'sendPayment')),
  }
  forward(tx, record, 'destinationTag', 'DestinationTag')
  forward(tx, record, 'invoiceID', 'InvoiceID')
  forward(tx, record, 'paths', 'Paths')
  if (record.sendMax !== undefined) {
    tx.SendMax = normalizeAmount(requireAmount(record.sendMax, 'sendPayment'))
  }
  if (record.deliverMin !== undefined) {
    tx.DeliverMin = normalizeAmount(
      requireAmount(record.deliverMin, 'sendPayment')
    )
  }
  forward(tx, record, 'flags', 'Flags')
  applyCommonFields(tx, record)
  return tx
}

/** Builds an XRPL `TrustSet` from a GemWallet `setTrustline` payload. */
export const buildTrustSetTx = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload, 'setTrustline')
  const tx: Record<string, unknown> = {
    TransactionType: 'TrustSet',
    LimitAmount: normalizeAmount(
      requireAmount(record.limitAmount, 'setTrustline', { tokenOnly: true })
    ),
  }
  forward(tx, record, 'qualityIn', 'QualityIn')
  forward(tx, record, 'qualityOut', 'QualityOut')
  forward(tx, record, 'flags', 'Flags')
  applyCommonFields(tx, record)
  return tx
}

/** Builds an XRPL `OfferCreate` from a GemWallet `createOffer` payload. */
export const buildOfferCreateTx = (
  payload: unknown
): Record<string, unknown> => {
  const record = asRecord(payload, 'createOffer')
  const tx: Record<string, unknown> = {
    TransactionType: 'OfferCreate',
    TakerGets: normalizeAmount(requireAmount(record.takerGets, 'createOffer')),
    TakerPays: normalizeAmount(requireAmount(record.takerPays, 'createOffer')),
  }
  forward(tx, record, 'expiration', 'Expiration')
  forward(tx, record, 'offerSequence', 'OfferSequence')
  forward(tx, record, 'flags', 'Flags')
  applyCommonFields(tx, record)
  return tx
}

/** Builds an XRPL `OfferCancel` from a GemWallet `cancelOffer` payload. */
export const buildOfferCancelTx = (
  payload: unknown
): Record<string, unknown> => {
  const record = asRecord(payload, 'cancelOffer')
  const tx: Record<string, unknown> = {
    TransactionType: 'OfferCancel',
    OfferSequence: requireInteger(record, 'offerSequence', 'cancelOffer'),
  }
  applyCommonFields(tx, record)
  return tx
}
