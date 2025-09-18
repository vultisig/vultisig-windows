import { suiGasBudget } from '@core/chain/chains/sui/config'
import { SuiCoin } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { TxInputDataResolver } from '../resolver'

export const getSuiTxInputData: TxInputDataResolver<'sui'> = ({
  keysignPayload,
}) => {
  const { coins, referenceGasPrice } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'suicheSpecific'
  )

  const inputData = TW.Sui.Proto.SigningInput.create({
    referenceGasPrice: Long.fromString(referenceGasPrice),
    signer: keysignPayload.coin?.address,
    gasBudget: Long.fromBigInt(suiGasBudget),

    paySui: TW.Sui.Proto.PaySui.create({
      inputCoins: coins.map((coin: SuiCoin) => {
        const obj = TW.Sui.Proto.ObjectRef.create({
          objectDigest: coin.digest,
          objectId: coin.coinObjectId,
          version: Long.fromString(coin.version),
        })
        return obj
      }),
      recipients: [keysignPayload.toAddress],
      amounts: [Long.fromString(keysignPayload.toAmount)],
    }),
  })

  return [TW.Sui.Proto.SigningInput.encode(inputData).finish()]
}
