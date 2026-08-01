import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { thorchainNativeTokensMetadata } from '@vultisig/core-chain/coin/knownTokens/thorchain'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { assertField } from '@vultisig/lib-utils/record/assertField'

type WasmExecuteTxDisplay = {
  coin: AccountCoin
  /** Funds amount in base units, taken straight from the signed contractPayload. */
  fundAmount: string
  receiver: string
}

/**
 * Resolves the funds asset from the (registry-known) denom synchronously so the
 * verify screens never briefly render the sender coin while a lookup is
 * pending. Unknown denoms fall back to the raw denom shown in base units — never
 * a substituted asset.
 */
const resolveFundCoin = (baseCoin: AccountCoin, denom: string): AccountCoin => {
  const { chain } = baseCoin

  const known = knownTokens[chain]?.find(token =>
    areEqualCoins(token, { id: denom, chain })
  )
  if (known) {
    return { ...baseCoin, ...known, address: baseCoin.address }
  }

  if (chain === Chain.THORChain) {
    const meta = thorchainNativeTokensMetadata[denom.toLowerCase()]
    if (meta) {
      return { ...baseCoin, id: denom, ...meta, address: baseCoin.address }
    }
  }

  // Unknown denom: show the raw denom in base units (decimals 0) rather than
  // substituting the sender coin, so the figure can never misrepresent the asset.
  return {
    ...baseCoin,
    id: denom,
    ticker: denom,
    decimals: 0,
    logo: baseCoin.logo,
  }
}

/**
 * A GENERIC_CONTRACT (CosmWasm execute) keysign tx is signed entirely from
 * `contractPayload`; its `toAddress`/`toAmount` are left empty. This derives the
 * fields the verify/joiner screens render — funds asset + amount and the
 * destination contract — from that same signed payload, so a co-signer sees
 * exactly what will be signed.
 *
 * Returns `null` for non-wasm txs and for wasm executes with no funds (e.g. RUJI
 * withdraw, whose amount lives inside the execute message), so callers keep
 * their standard `toAmount`/`toAddress` rendering there.
 */
export const getWasmExecuteTxDisplay = (
  keysignPayload: KeysignPayload
): WasmExecuteTxDisplay | null => {
  const wasm =
    keysignPayload.contractPayload?.case === 'wasmExecuteContractPayload'
      ? keysignPayload.contractPayload.value
      : undefined
  const fund = wasm?.coins[0]

  if (!wasm || !fund) {
    return null
  }

  const baseCoin = shouldBePresent(
    fromCommCoin(assertField(keysignPayload, 'coin'))
  )

  return {
    coin: resolveFundCoin(baseCoin, fund.denom),
    fundAmount: fund.amount,
    receiver: wasm.contractAddress,
  }
}
