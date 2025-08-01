import { create } from '@bufbuild/protobuf'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { pick } from '@lib/utils/record/pick'
import { useCallback } from 'react'

import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

export const useSendTxKeysignPayloadQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()

  const vault = useCurrentVault()

  const chainSpecific = useSendChainSpecificQuery()

  const utxoInfo = useKeysignUtxoInfo(pick(coin, ['chain', 'address']))

  const cappedAmount = useSendCappedAmountQuery()

  const walletCore = useAssertWalletCore()

  return useTransformQueriesData(
    {
      chainSpecific,
      cappedAmount,
      utxoInfo,
    },
    useCallback(
      ({ chainSpecific, cappedAmount, utxoInfo }) => {
        const publicKey = getPublicKey({
          chain: coin.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        return create(KeysignPayloadSchema, {
          coin: toCommCoin({
            ...coin,
            hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          }),
          toAddress: receiver,
          toAmount: cappedAmount.amount.toString(),
          blockchainSpecific: chainSpecific,
          memo,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
          utxoInfo: utxoInfo ?? undefined,
        })
      },
      [
        coin,
        memo,
        receiver,
        vault.hexChainCode,
        vault.libType,
        vault.localPartyId,
        vault.publicKeys,
        walletCore,
      ]
    )
  )
}
