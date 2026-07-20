import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { useQuery } from '@tanstack/react-query'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { assertField } from '@vultisig/lib-utils/record/assertField'

type WasmExecuteTxDisplay = {
  coin: AccountCoin
  amount: bigint
  receiver: string
}

/**
 * A GENERIC_CONTRACT (CosmWasm execute) keysign tx is signed entirely from
 * `contractPayload`; its `toAddress`/`toAmount` are left empty. This resolves
 * the fields the verify screens render — the funds asset + amount and the
 * destination contract — from that same signed payload, so a co-signer sees
 * exactly what will be signed rather than separate, spoofable display fields.
 *
 * Returns `null` for non-wasm txs and for wasm executes that carry no funds
 * (e.g. RUJI withdraw, whose amount is inside the execute message), so callers
 * keep their standard `toAmount`/`toAddress` rendering in those cases.
 */
export const useWasmExecuteTxDisplay = (
  keysignPayload: KeysignPayload
): WasmExecuteTxDisplay | null => {
  const getCoin = useGetCoin()
  const baseCoin = shouldBePresent(
    fromCommCoin(assertField(keysignPayload, 'coin'))
  )

  const wasm =
    keysignPayload.contractPayload?.case === 'wasmExecuteContractPayload'
      ? keysignPayload.contractPayload.value
      : undefined
  const fund = wasm?.coins[0]

  const { data: fundCoin } = useQuery({
    queryKey: ['wasmExecuteFundCoin', baseCoin.chain, fund?.denom],
    queryFn: () =>
      getCoin({ id: shouldBePresent(fund).denom, chain: baseCoin.chain }),
    enabled: fund !== undefined,
    staleTime: Infinity,
  })

  if (!wasm || !fund) {
    return null
  }

  return {
    // Keep the sender's chain/address, but show the funds asset (resolved from
    // the signed denom) once it loads.
    coin: fundCoin
      ? { ...baseCoin, ...fundCoin, address: baseCoin.address }
      : baseCoin,
    amount: BigInt(fund.amount),
    receiver: wasm.contractAddress,
  }
}
