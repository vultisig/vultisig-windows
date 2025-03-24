import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { processKeysignPayload } from '../../../chain/keysign/processKeysignPayload'
import { getSwapKeysignPayloadFields } from '../../../chain/swap/keysign/getSwapKeysignPayloadFields'
import { toHexPublicKey } from '../../../chain/utils/toHexPublicKey'
import { useVaultPublicKeyQuery } from '../../publicKey/queries/useVaultPublicKeyQuery'
import { useCurrentVault, useCurrentVaultCoin } from '../../state/currentVault'
import { useFromAmount } from '../state/fromAmount'
import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapKeysignPayloadQuery = () => {
  const [fromCoinKey] = useFromCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const [fromAmount] = useFromAmount()

  const swapQuoteQuery = useSwapQuoteQuery()

  const vault = useCurrentVault()

  const chainSpecificQuery = useSwapChainSpecificQuery()

  const publicKeyQuery = useVaultPublicKeyQuery(fromCoin.chain)

  const walletCore = useAssertWalletCore()

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      chainSpecific: chainSpecificQuery.data,
      fromAmount: fromAmount ?? undefined,
      publicKey: publicKeyQuery.data,
    },
    getQuery: ({ swapQuote, chainSpecific, fromAmount, publicKey }) => ({
      queryKey: ['swapKeysignPayload'],
      queryFn: async () => {
        const amount = toChainAmount(fromAmount, fromCoin.decimals)
        const swapSpecificFields = getSwapKeysignPayloadFields({
          amount,
          quote: swapQuote,
          fromCoin,
          toCoin,
        })

        const result = create(KeysignPayloadSchema, {
          coin: toCommCoin({
            ...fromCoin,
            hexPublicKey: toHexPublicKey({
              publicKey,
              walletCore,
            }),
          }),
          toAmount: amount.toString(),
          blockchainSpecific: chainSpecific,
          vaultLocalPartyId: vault.local_party_id,
          vaultPublicKeyEcdsa: vault.public_key_ecdsa,
          ...swapSpecificFields,
        })

        return processKeysignPayload(result)
      },
    }),
  })
}
