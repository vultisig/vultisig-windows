import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCoinType } from '@core/chain/coin/coinType'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { fromCommCoin } from '../../../types/utils/commCoin'
import { TxInputDataResolver } from '../TxInputDataResolver'

export const getThorTxInputData: TxInputDataResolver<
  'thorchainSpecific'
> = async ({ keysignPayload, walletCore, chain, chainSpecific }) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const commCoin = assertField(keysignPayload, 'coin')

  const fromAddr = walletCore.AnyAddress.createWithString(
    commCoin.address,
    coinType
  )

  const pubKeyData = Buffer.from(commCoin.hexPublicKey, 'hex')

  let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({})
  let message: TW.Cosmos.Proto.Message[]

  if (keysignPayload.memo?.startsWith('merge:')) {
    const fullDenom = keysignPayload.memo!.toLowerCase().replace('merge:', '')

    message = [
      TW.Cosmos.Proto.Message.create({
        wasmExecuteContractGeneric:
          TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
            senderAddress: commCoin.address,
            contractAddress: keysignPayload.toAddress,
            executeMsg: '{ "deposit": {} }',
            coins: [
              TW.Cosmos.Proto.Amount.create({
                denom: fullDenom,
                amount: keysignPayload.toAmount,
              }),
            ],
          }),
      }),
    ]
  } else if (chainSpecific.isDeposit) {
    thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
      asset: TW.Cosmos.Proto.THORChainAsset.create({
        chain: 'THOR',
        symbol: commCoin.ticker,
        ticker: commCoin.ticker,
        synth: false,
      }),
    })
    const toAmount = Number(keysignPayload.toAmount || '0')
    if (toAmount > 0) {
      thorchainCoin.amount = keysignPayload.toAmount
      thorchainCoin.decimals = new Long(commCoin.decimals)
    }

    message = [
      TW.Cosmos.Proto.Message.create({
        thorchainDepositMessage:
          TW.Cosmos.Proto.Message.THORChainDeposit.create({
            signer: fromAddr.data(),
            memo: keysignPayload.memo || '',
            coins: [thorchainCoin],
          }),
      }),
    ]
  } else {
    const toAddress = walletCore.AnyAddress.createWithString(
      keysignPayload.toAddress,
      coinType
    )
    if (!toAddress) {
      throw new Error('invalid to address')
    }
    const coin = fromCommCoin(commCoin)

    message = [
      TW.Cosmos.Proto.Message.create({
        thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
          fromAddress: fromAddr.data(),
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              denom: isFeeCoin(coin) ? cosmosFeeCoinDenom[chain] : coin.id,
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
    chainId: walletCore.CoinTypeExt.chainId(coinType),
    accountNumber: new Long(Number(chainSpecific.accountNumber)),
    sequence: new Long(Number(chainSpecific.sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: keysignPayload.memo || '',
    messages: message,
    fee: TW.Cosmos.Proto.Fee.create({
      gas: new Long(cosmosGasLimitRecord[chain]),
    }),
  })

  return [TW.Cosmos.Proto.SigningInput.encode(input).finish()]
}
