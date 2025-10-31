import { create } from '@bufbuild/protobuf'
import { isChainOfKind } from '@core/chain/ChainKind'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useCallback } from 'react'

import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery'
import { useSendFeeQuoteQuery } from '../queries/useSendFeeQuoteQuery'
import { useSendKeysignTxDataQuery } from '../queries/useSendKeysignTxDataQuery'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

export const useSendTxKeysignPayloadQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()

  const vault = useCurrentVault()

  const txData = useSendKeysignTxDataQuery()
  const feeQuote = useSendFeeQuoteQuery()

  const cappedAmount = useSendCappedAmountQuery()

  const walletCore = useAssertWalletCore()

  return useTransformQueriesData(
    {
      txData,
      cappedAmount,
      feeQuote,
    },
    useCallback(
      ({ txData, cappedAmount, feeQuote }) => {
        const publicKey = getPublicKey({
          chain: coin.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const blockchainSpecific = buildChainSpecific({
          chain: coin.chain,
          txData,
          feeQuote,
        })

        const keysignPayload = create(KeysignPayloadSchema, {
          coin: toCommCoin({
            ...coin,
            hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
          }),
          toAddress: receiver,
          toAmount: cappedAmount.amount.toString(),
          blockchainSpecific,
          memo,
          vaultLocalPartyId: vault.localPartyId,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          libType: vault.libType,
          utxoInfo: txData.utxoInfo,
        })

        if (isChainOfKind(coin.chain, 'utxo')) {
          return refineKeysignUtxo({
            keysignPayload,
            walletCore,
            publicKey,
          })
        }

        return keysignPayload
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
