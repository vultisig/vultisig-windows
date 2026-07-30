/**
 * Limit prefilled when opening a trust line: one quadrillion (1e15) units.
 *
 * A TrustSet's amount IS the line's limit — the maximum of the issuer's currency
 * this account is willing to hold — and XRPL has no "unlimited" encoding, so
 * opening a line means committing to a number. This one is large enough to be
 * effectively unlimited for any real holding while staying EXACTLY
 * representable: an XRPL issued-currency value carries 15 significant decimal
 * digits, and 1e15 is a single significant digit followed by zeros, so it
 * round-trips through the value encoding without truncation. A limit of 15 nines
 * would sit right on the precision boundary and is deliberately avoided.
 *
 * In display units, matching the deposit form's amount field — the form converts
 * to base units when it builds the keysign payload.
 */
export const defaultRippleTrustLineLimit = 1e15
