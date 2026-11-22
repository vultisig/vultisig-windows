import { AminoMsg, Coin } from '@cosmjs/amino'

const isIntegerString = (value: unknown): value is string =>
  typeof value === 'string' && /^\d+$/.test(value)

const sumSplitRouteAmounts = (routes: unknown): string | undefined => {
  if (!Array.isArray(routes) || routes.length === 0) return undefined

  const amounts = routes.map(route => route?.token_in_amount)
  if (!amounts.every(isIntegerString)) return undefined

  return amounts.reduce((sum, amount) => sum + BigInt(amount), 0n).toString()
}

/**
 * Picks the coin an amino message moves out of the signer's account, for
 * display in the Sign Transaction popup and history. The coin sits in a
 * different field per message shape: Osmosis swaps use `token_in`, Osmosis
 * split-route swaps use `token_in_denom` plus the sum of each route's
 * `token_in_amount`, IBC transfers use `token`, bank sends `amount[0]` and
 * wasm executes `funds[0]`. Malformed split routes fall through to the other
 * shapes instead of throwing, and `undefined` means no coin was found.
 */
export const getAminoSentCoin = (
  value: AminoMsg['value']
): Coin | undefined => {
  if (value.token_in) {
    return value.token_in
  }

  if (typeof value.token_in_denom === 'string') {
    const amount = sumSplitRouteAmounts(value.routes)
    if (amount !== undefined) {
      return { denom: value.token_in_denom, amount }
    }
  }

  return value.token ?? value.amount?.[0] ?? value.funds?.[0]
}
