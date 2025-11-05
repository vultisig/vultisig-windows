import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { SuiCoin } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { SigningInputsResolver } from '../resolver'

const suiContractAddress = '0x2::sui::SUI'

export const getSuiSigningInputs: SigningInputsResolver<'sui'> = ({
  keysignPayload,
}) => {
  const coin = getKeysignCoin(keysignPayload)
  const { coins, referenceGasPrice, gasBudget } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'suicheSpecific'
  )

  const isNativeSui = isFeeCoin(coin)
  const coinType = coin.id || suiContractAddress

  const suiCoins = coins.filter(c => c.coinType === suiContractAddress)
  const tokenCoins = coins.filter(
    c => c.coinType === coinType && c.coinType !== suiContractAddress
  )

  const createObjectRef = (coin: SuiCoin) =>
    TW.Sui.Proto.ObjectRef.create({
      objectDigest: coin.digest,
      objectId: coin.coinObjectId,
      version: Long.fromString(coin.version),
    })

  const gasCoins = suiCoins.map(createObjectRef)
  const gasPayment = gasCoins.length > 0 ? gasCoins[0] : undefined

  const baseInput = {
    referenceGasPrice: Long.fromString(referenceGasPrice),
    signer: coin.address,
    gasBudget: Long.fromString(gasBudget),
  }

  if (isNativeSui) {
    return [
      TW.Sui.Proto.SigningInput.create({
        ...baseInput,
        paySui: TW.Sui.Proto.PaySui.create({
          inputCoins: suiCoins.map(createObjectRef),
          recipients: [keysignPayload.toAddress],
          amounts: [Long.fromString(keysignPayload.toAmount)],
        }),
      }),
    ]
  } else {
    return [
      TW.Sui.Proto.SigningInput.create({
        ...baseInput,
        pay: TW.Sui.Proto.Pay.create({
          gas: gasPayment,
          inputCoins: tokenCoins.map(createObjectRef),
          recipients: [keysignPayload.toAddress],
          amounts: [Long.fromString(keysignPayload.toAmount)],
        }),
      }),
    ]
  }
}
