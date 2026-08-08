import {
  parseRippleTokenId,
  toXrplCurrencyCode,
} from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { attempt } from '@vultisig/lib-utils/attempt'

/** The fields of an `account_lines` entry this check reads. */
export type RippleTrustLine = {
  /** The counterparty of the line — the issuer, from the holder's perspective. */
  account: string
  currency: string
}

type NeedsRippleTrustLineInput = {
  /** Composite `<currencyCode>.<issuer>` id of an XRPL issued currency. */
  tokenId: string
  /** Every trust line the account currently holds. */
  lines: RippleTrustLine[]
}

/**
 * Whether the account still has to open a trust line before it can hold the
 * issued currency `tokenId`.
 *
 * A token can sit in the vault's asset list with no line behind it — the user
 * added it manually, or removed the line after acquiring it — and until the line
 * exists the balance is stuck at zero and any incoming payment is rejected by
 * the ledger.
 *
 * Currency codes are compared normalised, so a node spelling a non-standard code
 * in lowercase hex still matches the coin whose id holds it uppercased. Issuer
 * addresses are base58 and compared case-SENSITIVELY, matching how the SDK's
 * balance resolver matches a line.
 *
 * An id that cannot be parsed reports `false`: there is no line to open for
 * something we cannot resolve to a (currency, issuer) pair, and offering the
 * action anyway would send the user into a flow that cannot be completed.
 */
export const needsRippleTrustLine = ({
  tokenId,
  lines,
}: NeedsRippleTrustLineInput): boolean => {
  const parsed = attempt(() => parseRippleTokenId(tokenId))
  if ('error' in parsed) {
    return false
  }

  const { currency, issuer } = parsed.data

  const currencyCode = attempt(() => toXrplCurrencyCode(currency))
  if ('error' in currencyCode) {
    return false
  }

  return !lines.some(
    line =>
      line.account === issuer &&
      withFallbackCurrencyCode(line.currency) === currencyCode.data
  )
}

/**
 * On-ledger form of a currency code coming off the wire. A code we cannot encode
 * is kept verbatim so it simply fails to match, rather than throwing and taking
 * the whole check down with it.
 */
const withFallbackCurrencyCode = (currency: string): string => {
  const code = attempt(() => toXrplCurrencyCode(currency))

  return 'error' in code ? currency : code.data
}
