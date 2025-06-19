import {
  Chain,
  CosmosChainKind,
  VaultBasedCosmosChain,
} from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCosmosChainKind } from '@core/chain/chains/cosmos/utils/getCosmosChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { fromCommCoin } from '../../../types/utils/commCoin'
import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { TxInputDataResolver } from '../TxInputDataResolver'
import { getCosmosSharedChainSpecific } from './chainSpecific/shared'
import { getVaultBasedCosmosChainSpecific } from './chainSpecific/vaultBased'

export const getCosmosTxInputData: TxInputDataResolver<'cosmos'> = ({
  keysignPayload,
  walletCore,
  chain,
}) => {
  const commCoin = assertField(keysignPayload, 'coin')

  const pubKeyData = Buffer.from(commCoin.hexPublicKey, 'hex')

  const chainKind = getCosmosChainKind(chain)

  const { blockchainSpecific, memo } = keysignPayload

  const denom = cosmosFeeCoinDenom[chain]

  const getMemo = (): string | undefined => {
    if (!memo) return

    const shouldPropagateMemo = match<CosmosChainKind, boolean>(chainKind, {
      ibcEnabled: () => {
        const { isDeposit } = getVaultBasedCosmosChainSpecific(
          chain as VaultBasedCosmosChain,
          keysignPayload.blockchainSpecific
        )

        return !isDeposit
      },
      vaultBased: () => {
        const { transactionType } = getBlockchainSpecificValue(
          blockchainSpecific,
          'cosmosSpecific'
        )

        return !isOneOf(transactionType, [
          TransactionType.IBC_TRANSFER,
          TransactionType.VOTE,
        ])
      },
    })

    return shouldPropagateMemo ? memo : undefined
  }

  const getMessages = (): TW.Cosmos.Proto.Message[] => {
    return match<CosmosChainKind, TW.Cosmos.Proto.Message[]>(chainKind, {
      ibcEnabled: () => {
        const { transactionType, ibcDenomTraces } = getBlockchainSpecificValue(
          keysignPayload.blockchainSpecific,
          'cosmosSpecific'
        )

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
                  denom: commCoin.isNativeToken
                    ? cosmosFeeCoinDenom[chain]
                    : commCoin.contractAddress,
                  amount: keysignPayload.toAmount,
                },
                sender: commCoin.address,
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
              fromAddress: commCoin.address,
              toAddress: keysignPayload.toAddress,
              amounts: [
                TW.Cosmos.Proto.Amount.create({
                  amount: keysignPayload.toAmount,
                  denom: commCoin.isNativeToken
                    ? denom
                    : commCoin.contractAddress,
                }),
              ],
            }),
          }),
        ]
      },
      vaultBased: () => {
        const coinType = getCoinType({
          walletCore,
          chain,
        })

        const fromAddr = walletCore.AnyAddress.createWithString(
          commCoin.address,
          coinType
        )

        const { isDeposit } = getVaultBasedCosmosChainSpecific(
          chain as VaultBasedCosmosChain,
          keysignPayload.blockchainSpecific
        )

        if (keysignPayload.memo?.startsWith('merge:')) {
          const fullDenom = keysignPayload
            .memo!.toLowerCase()
            .replace('merge:', '')

          return [
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
        } else if (isDeposit) {
          const depositCoin = TW.Cosmos.Proto.THORChainCoin.create({
            asset: TW.Cosmos.Proto.THORChainAsset.create({
              chain: match(chain as VaultBasedCosmosChain, {
                [Chain.THORChain]: () => 'THOR',
                [Chain.MayaChain]: () => 'MAYA',
              }),
              symbol: commCoin.ticker,
              ticker: commCoin.ticker,
              synth: false,
            }),
          })
          const toAmount = Number(keysignPayload.toAmount || '0')
          if (toAmount > 0) {
            depositCoin.amount = keysignPayload.toAmount
            depositCoin.decimals = new Long(commCoin.decimals)
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
        const coin = fromCommCoin(commCoin)

        return [
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
          denom: denom,
        }),
      ]
    }

    return result
  }

  const { accountNumber, sequence } = getCosmosSharedChainSpecific(
    chain,
    keysignPayload.blockchainSpecific
  )

  const getChainId = () => {
    if (chain === Chain.MayaChain) {
      return 'mayachain-mainnet-v1'
    }

    const coinType = getCoinType({
      walletCore,
      chain,
    })

    return walletCore.CoinTypeExt.chainId(coinType)
  }

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: new Uint8Array(pubKeyData),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: getChainId(),
    accountNumber: new Long(Number(accountNumber)),
    sequence: new Long(Number(sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: getMemo(),
    messages: getMessages(),
    fee: getFee(),
  })

  return [TW.Cosmos.Proto.SigningInput.encode(input).finish()]
}
