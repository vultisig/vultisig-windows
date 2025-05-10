import { create } from '@bufbuild/protobuf'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { processKeysignPayload } from '@core/mpc/keysign/keysignPayload/processKeysignPayload'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'

export const useSendTxKeysignPayloadQuery = () => {
  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()

  const vault = useCurrentVault()

  const chainSpecificQuery = useSendChainSpecificQuery()

  const cappedAmountQuery = useSendCappedAmountQuery()

  const walletCore = useAssertWalletCore()

  return useStateDependentQuery({
    state: {
      chainSpecific: chainSpecificQuery.data,
      cappedAmount: cappedAmountQuery.data,
    },
    getQuery: ({ chainSpecific, cappedAmount }) => ({
      queryKey: ['sendKeysignPayload'],
      queryFn: async () => {
        const publicKey = getPublicKey({
          chain: coin.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        return processKeysignPayload(
          create(KeysignPayloadSchema, {
            coin: toCommCoin({
              ...coin,
              hexPublicKey: toHexPublicKey({
                publicKey,
                walletCore,
              }),
            }),
            toAddress: receiver,
            toAmount: cappedAmount.amount.toString(),
            blockchainSpecific: chainSpecific,
            memo,
            vaultLocalPartyId: vault.localPartyId,
            vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          })
        )
      },
    }),
  })
}
