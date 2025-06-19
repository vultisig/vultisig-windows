import { Chain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCosmosChainKind } from '@core/chain/chains/cosmos/utils/getCosmosChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignTwPublicKey } from '../../tw/getKeysignTwPublicKey'
import { getTwChainId } from '../../tw/getTwChainId'
import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { TxInputDataResolver } from '../TxInputDataResolver'
import { getCosmosChainSpecific } from './chainSpecific'
import { shouldPropagateMemo } from './memo'

export const getCosmosTxInputData: TxInputDataResolver<'cosmos'> = ({
  keysignPayload,
  walletCore,
  chain,
}) => {
  const coin = getKeysignCoin(keysignPayload)

  const chainKind = getCosmosChainKind(chain)

  const chainSpecific = getCosmosChainSpecific(
    chain,
    keysignPayload.blockchainSpecific
  )

  const { memo } = keysignPayload

  const getMessages = (): TW.Cosmos.Proto.Message[] => {
    return matchRecordUnion(chainSpecific, {
      ibcEnabled: ({ transactionType, ibcDenomTraces }) => {
        if (transactionType === TransactionType.IBC_TRANSFER) {
          const memo = shouldBePresent(keysignPayload.memo)
          const [, channel] = memo.split(':')

          const timeoutTimestamp = Long.fromString(
            ibcDenomTraces?.latestBlock?.split('_')?.[1] || '0'
          )

          return [
            TW.Cosmos.Proto.Message.create({
              transferTokensMessage: TW.Cosmos.Proto.Message.Transfer.create({
                sourcePort: 'transfer',
                sourceChannel: channel,
                token: {
                  denom: coin.id,
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
        }

        return [
          TW.Cosmos.Proto.Message.create({
            sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
              fromAddress: coin.address,
              toAddress: keysignPayload.toAddress,
              amounts: [
                TW.Cosmos.Proto.Amount.create({
                  amount: keysignPayload.toAmount,
                  denom: coin.id,
                }),
              ],
            }),
          }),
        ]
      },
      vaultBased: ({ isDeposit }) => {
        const coinType = getCoinType({
          walletCore,
          chain,
        })

        const fromAddr = walletCore.AnyAddress.createWithString(
          coin.address,
          coinType
        )

        if (keysignPayload.memo?.startsWith('merge:')) {
          const fullDenom = keysignPayload
            .memo!.toLowerCase()
            .replace('merge:', '')

          return [
            TW.Cosmos.Proto.Message.create({
              wasmExecuteContractGeneric:
                TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
                  senderAddress: coin.address,
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
        } else if (isDeposit) {
          const depositCoin = TW.Cosmos.Proto.THORChainCoin.create({
            asset: TW.Cosmos.Proto.THORChainAsset.create({
              chain: match(chain as VaultBasedCosmosChain, {
                [Chain.THORChain]: () => 'THOR',
                [Chain.MayaChain]: () => 'MAYA',
              }),
              symbol: coin.ticker,
              ticker: coin.ticker,
              synth: false,
            }),
          })
          const toAmount = Number(keysignPayload.toAmount || '0')
          if (toAmount > 0) {
            depositCoin.amount = keysignPayload.toAmount
            depositCoin.decimals = new Long(coin.decimals)
          }

          return [
            TW.Cosmos.Proto.Message.create({
              thorchainDepositMessage:
                TW.Cosmos.Proto.Message.THORChainDeposit.create({
                  signer: fromAddr.data(),
                  memo: keysignPayload.memo || '',
                  coins: [depositCoin],
                }),
            }),
          ]
        }
        const toAddress = match(chain as VaultBasedCosmosChain, {
          [Chain.THORChain]: () =>
            walletCore.AnyAddress.createWithString(
              keysignPayload.toAddress,
              coinType
            ),
          [Chain.MayaChain]: () =>
            walletCore.AnyAddress.createBech32(
              keysignPayload.toAddress,
              coinType,
              'maya'
            ),
        })
        return [
          TW.Cosmos.Proto.Message.create({
            thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
              fromAddress: fromAddr.data(),
              amounts: [
                TW.Cosmos.Proto.Amount.create({
                  denom: coin.id,
                  amount: keysignPayload.toAmount,
                }),
              ],
              toAddress: toAddress.data(),
            }),
          }),
        ]
      },
    })
  }

  const getFee = () => {
    const result = TW.Cosmos.Proto.Fee.create({
      gas: new Long(cosmosGasLimitRecord[chain]),
    })

    if (chainKind === 'ibcEnabled') {
      const { gas: gasAmount } = getBlockchainSpecificValue(
        keysignPayload.blockchainSpecific,
        'cosmosSpecific'
      )
      result.amounts = [
        TW.Cosmos.Proto.Amount.create({
          amount: gasAmount.toString(),
          denom: cosmosFeeCoinDenom[chain],
        }),
      ]
    }

    return result
  }

  const { accountNumber, sequence } = getRecordUnionValue(chainSpecific)

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: getKeysignTwPublicKey(keysignPayload),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: getTwChainId({ walletCore, chain }),
    accountNumber: new Long(Number(accountNumber)),
    sequence: new Long(Number(sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: memo && shouldPropagateMemo(chainSpecific) ? memo : undefined,
    messages: getMessages(),
    fee: getFee(),
  })

  return [TW.Cosmos.Proto.SigningInput.encode(input).finish()]
}
