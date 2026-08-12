import { toIssuedCurrencyTicker } from '@core/ui/chain/coin/ripple/toIssuedCurrencyTicker'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { attempt } from '@vultisig/lib-utils/attempt'

import { hasPartialPaymentFlag, parseRippleTxFlags } from './rippleTxFlags'

const xrpDecimals = 6

/** An XRPL amount: a drops string (native XRP) or an issued-currency object. */
export type RippleAmount =
  | { kind: 'native'; xrp: string }
  | { kind: 'issued'; value: string; currency: string; issuer: string }

/** i18n keys for the decoded rows — literals so `t()` accepts them. */
type RippleFieldLabelKey =
  | 'ripple_field_destination'
  | 'ripple_field_destination_tag'
  | 'ripple_field_amount'
  | 'ripple_field_send_max'
  | 'ripple_field_deliver_min'
  | 'ripple_field_taker_gets'
  | 'ripple_field_taker_pays'
  | 'ripple_field_trust_limit'
  | 'ripple_field_offer_sequence'

/**
 * i18n keys for the routing-control caveats. These are not rows: they change
 * what the decoded rows *mean*, so the display renders them as warnings rather
 * than as more values to skim past.
 */
type RippleTxWarningKey =
  | 'ripple_warning_partial_payment'
  | 'ripple_warning_custom_paths'

type RippleTxField = {
  labelKey: RippleFieldLabelKey
  amount?: RippleAmount
  text?: string
}

type RippleTxData = {
  transactionType: string
  fields: RippleTxField[]
  warnings: RippleTxWarningKey[]
}

const parseAmount = (value: unknown): RippleAmount | undefined => {
  if (typeof value === 'string') {
    // Amount is dApp-controlled and its format is not sanitized upstream, so a
    // non-numeric drops string must not throw `BigInt` mid-render — drop the
    // row instead, honoring this parser's "never throws" contract.
    const drops = attempt(() => BigInt(value))
    if ('error' in drops) return undefined

    return {
      kind: 'native',
      xrp: fromChainAmount(drops.data, xrpDecimals).toString(),
    }
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    'currency' in value &&
    'issuer' in value &&
    typeof value.value === 'string' &&
    typeof value.currency === 'string' &&
    typeof value.issuer === 'string'
  ) {
    return {
      kind: 'issued',
      value: value.value,
      currency: toIssuedCurrencyTicker(value.currency),
      issuer: value.issuer,
    }
  }

  return undefined
}

// The value-bearing amount fields, in display order. A cross-currency Payment
// (the common XRPL DEX swap: Destination = self) pairs `Amount` (what you
// receive) with `SendMax` (what you pay), so both must be shown.
const rippleAmountFields: Array<[key: string, labelKey: RippleFieldLabelKey]> =
  [
    ['Amount', 'ripple_field_amount'],
    ['SendMax', 'ripple_field_send_max'],
    ['DeliverMin', 'ripple_field_deliver_min'],
    ['TakerGets', 'ripple_field_taker_gets'],
    ['TakerPays', 'ripple_field_taker_pays'],
    ['LimitAmount', 'ripple_field_trust_limit'],
  ]

/**
 * Extracts the human-relevant fields from a dApp XRPL transaction so the
 * confirmation screen renders decoded terms — destination, amounts, offer
 * sides — instead of raw JSON. Never throws: this feeds a display.
 *
 * Alongside the rows it reports the caveats that redefine them: a
 * `tfPartialPayment` `Payment` whose `Amount` is a ceiling rather than a
 * delivery, and a dApp-chosen `Paths` steering how the payment is routed. Both
 * are signed either way, so leaving them out of the display would show terms
 * strictly better than the ones being approved.
 *
 * Returns `null` (which the display routes to its raw-JSON fallback) when the
 * transaction can't be trusted as decoded — unparseable input, a missing
 * `TransactionType`, an undecodable `Flags`, or a **present but undecodable
 * value-bearing field**. Those cases fail closed on purpose: silently omitting
 * a malformed `Amount` / `SendMax`, or reading flags we cannot decode as unset,
 * would render a seemingly-complete transaction with its value hidden, letting
 * the user approve without seeing what they pay.
 */
export const parseRippleTx = (rawJson: string): RippleTxData | null => {
  const parsed = attempt(() => JSON.parse(rawJson) as unknown)
  if ('error' in parsed) return null

  const tx = parsed.data
  if (typeof tx !== 'object' || tx === null) return null

  const record = tx as Record<string, unknown>
  const transactionType =
    typeof record.TransactionType === 'string' ? record.TransactionType : null
  if (!transactionType) return null

  const flags = parseRippleTxFlags(record.Flags)
  if (flags === null) return null

  const warnings: RippleTxWarningKey[] = []
  if (transactionType === 'Payment' && hasPartialPaymentFlag(flags)) {
    warnings.push('ripple_warning_partial_payment')
  }
  if (record.Paths !== undefined) {
    warnings.push('ripple_warning_custom_paths')
  }

  const fields: RippleTxField[] = []

  if (typeof record.Destination === 'string') {
    fields.push({
      labelKey: 'ripple_field_destination',
      text: record.Destination,
    })
  }

  for (const [key, labelKey] of rippleAmountFields) {
    if (record[key] === undefined) continue

    const amount = parseAmount(record[key])
    if (!amount) return null

    fields.push({ labelKey, amount })
  }

  if (typeof record.DestinationTag === 'number') {
    fields.push({
      labelKey: 'ripple_field_destination_tag',
      text: String(record.DestinationTag),
    })
  }
  if (typeof record.OfferSequence === 'number') {
    fields.push({
      labelKey: 'ripple_field_offer_sequence',
      text: String(record.OfferSequence),
    })
  }

  return { transactionType, fields, warnings }
}
