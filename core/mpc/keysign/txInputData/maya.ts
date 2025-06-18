import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCoinType } from '@core/chain/coin/coinType'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { TxInputDataResolver } from './TxInputDataResolver'

export const getMayaTxInputData: TxInputDataResolver<'cosmos'> = ({
  keysignPayload,
  walletCore,
  chain,
}) => {
  const { isDeposit, accountNumber, sequence } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'mayaSpecific'
  )

  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const coin = assertField(keysignPayload, 'coin')

  const fromAddr = walletCore.AnyAddress.createBech32(
    coin.address,
    coinType,
    'maya'
  )

  const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex')

  let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({})

  const getMessages = (): TW.Cosmos.Proto.Message[] => {
    if (isDeposit) {
      thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
        asset: TW.Cosmos.Proto.THORChainAsset.create({
          chain: 'MAYA',
          symbol: 'CACAO',
          ticker: 'CACAO',
          synth: false,
        }),
      })

      const toAmount = Number(keysignPayload.toAmount || '0')
      if (toAmount > 0) {
        thorchainCoin.amount = keysignPayload.toAmount
        thorchainCoin.decimals = new Long(coin.decimals)
      }

      return [
        TW.Cosmos.Proto.Message.create({
          thorchainDepositMessage:
            TW.Cosmos.Proto.Message.THORChainDeposit.create({
              signer: fromAddr.data(),
              memo: keysignPayload.memo || '',
              coins: [thorchainCoin],
            }),
        }),
      ]
    }
    const toAddress = walletCore.AnyAddress.createBech32(
      keysignPayload.toAddress,
      coinType,
      'maya'
    )

    if (toAddress.description() !== keysignPayload.toAddress) {
      throw new Error('To address is different from the bech32 address')
    }

    return [
      TW.Cosmos.Proto.Message.create({
        thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
          fromAddress: fromAddr.data(),
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              denom: coin.ticker.toLowerCase(),
              amount: keysignPayload.toAmount,
            }),
          ],
          toAddress: toAddress.data(),
        }),
      }),
    ]
  }

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: new Uint8Array(pubKeyData),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: 'mayachain-mainnet-v1',
    accountNumber: new Long(Number(accountNumber)),
    sequence: new Long(Number(sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: keysignPayload.memo || '',
    messages: getMessages(),
    fee: TW.Cosmos.Proto.Fee.create({
      gas: new Long(cosmosGasLimitRecord[chain]),
    }),
  })

  return [TW.Cosmos.Proto.SigningInput.encode(input).finish()]
}
