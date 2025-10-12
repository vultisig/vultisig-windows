import { create } from '@bufbuild/protobuf'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useCallback } from 'react'

import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery'
import { useSendFeeQuote } from '../queries/useSendFeeQuoteQuery'
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
  const feeQuote = useSendFeeQuote()

  const cappedAmount = useSendCappedAmountQuery()

  const walletCore = useAssertWalletCore()

  return useTransformQueriesData(
    {
      txData,
      cappedAmount,
    },
    useCallback(
      ({ txData, cappedAmount }) => {
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

        return create(KeysignPayloadSchema, {
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
      },
      [
        coin,
        memo,
        feeQuote,
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
