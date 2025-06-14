import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCoinType } from '@core/chain/coin/coinType'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { TxInputDataResolver } from './TxInputDataResolver'

export const getCosmosTxInputData: TxInputDataResolver<'cosmosSpecific'> = ({
  keysignPayload,
  walletCore,
  chain,
  chainSpecific,
}) => {
  const coin = assertField(keysignPayload, 'coin')

  const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex')

  const denom = cosmosFeeCoinDenom[chain]
  let message: TW.Cosmos.Proto.Message[]
  if (chainSpecific.transactionType === TransactionType.IBC_TRANSFER) {
    const memo = shouldBePresent(keysignPayload.memo)
    const [, channel] = memo.split(':')

    const timeoutTimestamp = Long.fromString(
      chainSpecific.ibcDenomTraces?.latestBlock?.split('_')?.[1] || '0'
    )

    message = [
      TW.Cosmos.Proto.Message.create({
        transferTokensMessage: TW.Cosmos.Proto.Message.Transfer.create({
          sourcePort: 'transfer',
          sourceChannel: channel,
          token: {
            denom: coin.isNativeToken
              ? cosmosFeeCoinDenom[coin.chain as CosmosChain]
              : coin.contractAddress,
            amount: keysignPayload.toAmount,
          },
          sender: coin.address,
          receiver: keysignPayload.toAddress,
          timeoutHeight: {
            revisionNumber: Long.fromString('0'),
            revisionHeight: Long.fromString('0'),
          },
          timeoutTimestamp,
        }),
      }),
    ]
  } else {
    message = [
      TW.Cosmos.Proto.Message.create({
        sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
          fromAddress: coin.address,
          toAddress: keysignPayload.toAddress,
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              amount: keysignPayload.toAmount,
              denom: coin.isNativeToken ? denom : coin.contractAddress,
            }),
          ],
        }),
      }),
    ]
  }

  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: new Uint8Array(pubKeyData),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: walletCore.CoinTypeExt.chainId(coinType),
    accountNumber: new Long(Number(chainSpecific.accountNumber)),
    sequence: new Long(Number(chainSpecific.sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo:
      chainSpecific.transactionType !== TransactionType.VOTE &&
      chainSpecific.transactionType !== TransactionType.IBC_TRANSFER
        ? keysignPayload.memo || ''
        : '',
    messages: message,
    fee: TW.Cosmos.Proto.Fee.create({
      gas: new Long(Number(cosmosGasLimitRecord[chain])),
      amounts: [
        TW.Cosmos.Proto.Amount.create({
          amount: chainSpecific.gas.toString(),
          denom: denom,
        }),
      ],
    }),
  })

  return [TW.Cosmos.Proto.SigningInput.encode(input).finish()]
}
