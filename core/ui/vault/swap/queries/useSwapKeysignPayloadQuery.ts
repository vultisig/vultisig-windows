import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import type { GeneralSwapTx } from '@core/chain/swap/general/GeneralSwapQuote'
import { getSwapKeysignPayloadFields } from '@core/chain/swap/keysign/getSwapKeysignPayloadFields'
import type { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useErc20ApprovePayloadQuery } from '@core/ui/mpc/keysign/evm/queries/erc20ApprovePayload'
import { useKeysignUtxoInfo } from '@core/ui/mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useSwapChainSpecificQuery } from '@core/ui/vault/swap/queries/useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from '@core/ui/vault/swap/queries/useSwapQuoteQuery'
import { useFromAmount } from '@core/ui/vault/swap/state/fromAmount'
import { useToCoin } from '@core/ui/vault/swap/state/toCoin'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

export const useSwapKeysignPayloadQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [toCoinKey] = useToCoin()
  const [fromAmount] = useFromAmount()
  const chainSpecificQuery = useSwapChainSpecificQuery()
  const swapQuoteQuery = useSwapQuoteQuery()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)
  const amount = toChainAmount(shouldBePresent(fromAmount), fromCoin.decimals)
  const utxoInfo = useKeysignUtxoInfo(pick(fromCoin, ['chain', 'address']))

  const spender = useMemo(() => {
    const swapQuote = swapQuoteQuery.data
    if (!swapQuote) return ''
    return matchRecordUnion<SwapQuote, string>(swapQuote, {
      native: ({ router }) => router ?? '',
      general: ({ tx }) =>
        matchRecordUnion<GeneralSwapTx, string>(tx, {
          evm: ({ to }) => to,
          solana: () => '',
        }),
    })
  }, [swapQuoteQuery.data])

  const erc20ApprovePayloadQuery = useErc20ApprovePayloadQuery({
    chain: fromCoin.chain,
    address: fromCoin.address,
    id: fromCoin.id,
    spender,
    amount,
  })

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
      erc20ApprovePayload: erc20ApprovePayloadQuery,
      utxoInfo,
    },
    ({ swapQuote, chainSpecific, utxoInfo, erc20ApprovePayload }) => {
      const fromPublicKey = getPublicKey({
        chain: fromCoin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

      const toPublicKey = getPublicKey({
        chain: toCoin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

      const fromCoinHexPublicKey = Buffer.from(fromPublicKey.data()).toString(
        'hex'
      )

      const toCoinHexPublicKey = Buffer.from(toPublicKey.data()).toString('hex')

      const swapSpecificFields = getSwapKeysignPayloadFields({
        amount,
        quote: swapQuote,
        fromCoin: {
          ...fromCoin,
          hexPublicKey: fromCoinHexPublicKey,
        },
        toCoin: {
          ...toCoin,
          hexPublicKey: toCoinHexPublicKey,
        },
      })

      return create(KeysignPayloadSchema, {
        coin: toCommCoin({
          ...fromCoin,
          hexPublicKey: fromCoinHexPublicKey,
        }),
        toAmount: amount.toString(),
        blockchainSpecific: chainSpecific,
        vaultLocalPartyId: vault.localPartyId,
        vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
        libType: vault.libType,
        erc20ApprovePayload: erc20ApprovePayload ?? undefined,
        utxoInfo: utxoInfo ?? undefined,
        ...swapSpecificFields,
      })
    }
  )
}
