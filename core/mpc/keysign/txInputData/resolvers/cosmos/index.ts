import { Chain, CosmosChain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getCosmosGasLimit } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCosmosChainKind } from '@core/chain/chains/cosmos/utils/getCosmosChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { nativeSwapChainIds } from '@core/chain/swap/native/NativeSwapChain'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getKeysignSwapPayload } from '../../../swap/getKeysignSwapPayload'
import { getKeysignTwPublicKey } from '../../../tw/getKeysignTwPublicKey'
import { getTwChainId } from '../../../tw/getTwChainId'
import { toTwAddress } from '../../../tw/toTwAddress'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { TxInputDataResolver } from '../../resolver'
import { CosmosChainSpecific, getCosmosChainSpecific } from './chainSpecific'
import { getCosmosCoinAmount } from './coinAmount'

export const getCosmosTxInputData: TxInputDataResolver<'cosmos'> = ({
  keysignPayload,
  walletCore,
  chain,
}) => {
  const coin = getKeysignCoin<CosmosChain>(keysignPayload)

  const chainKind = getCosmosChainKind(chain)

  const chainSpecific = getCosmosChainSpecific(
    chain,
    keysignPayload.blockchainSpecific
  )

  const { memo, toAddress } = keysignPayload

  const { messages, txMemo } = matchRecordUnion<
    CosmosChainSpecific,
    {
      messages: TW.Cosmos.Proto.Message[]
      txMemo?: string
    }
  >(chainSpecific, {
    ibcEnabled: ({ transactionType, ibcDenomTraces }) => {
      if (transactionType === TransactionType.IBC_TRANSFER) {
        const memo = shouldBePresent(keysignPayload.memo)
        const [, channel] = memo.split(':')

        const timeoutTimestamp = Long.fromString(
          ibcDenomTraces?.latestBlock?.split('_')?.[1] || '0'
        )

        return {
          messages: [
            TW.Cosmos.Proto.Message.create({
              transferTokensMessage: TW.Cosmos.Proto.Message.Transfer.create({
                sourcePort: 'transfer',
                sourceChannel: channel,
                token: getCosmosCoinAmount(keysignPayload),
                sender: coin.address,
                receiver: toAddress,
                timeoutHeight: {
                  revisionNumber: Long.fromString('0'),
                  revisionHeight: Long.fromString('0'),
                },
                timeoutTimestamp,
              }),
            }),
          ],
          txMemo: memo,
        }
      }

      return {
        messages: [
          TW.Cosmos.Proto.Message.create({
            sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
              fromAddress: coin.address,
              toAddress,
              amounts: [
                TW.Cosmos.Proto.Amount.create(
                  getCosmosCoinAmount(keysignPayload)
                ),
              ],
            }),
          }),
        ],
        txMemo: memo,
      }
    },
    vaultBased: ({ isDeposit }) => {
      const fromAddress = toTwAddress({
        address: coin.address,
        walletCore,
        chain,
      })

      if (
        keysignPayload.contractPayload &&
        keysignPayload.contractPayload.case === 'wasmExecuteContractPayload'
      ) {
        const contractPayload = keysignPayload.contractPayload.value

        return {
          messages: [
            TW.Cosmos.Proto.Message.create({
              wasmExecuteContractGeneric:
                TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
                  senderAddress: contractPayload.senderAddress,
                  contractAddress: contractPayload.contractAddress,
                  executeMsg: contractPayload.executeMsg,
                  coins: contractPayload.coins,
                }),
            }),
          ],
          txMemo: memo,
        }
      } else if (memo && memo.startsWith('merge:')) {
        const fullDenom = memo.toLowerCase().replace('merge:', '')

        return {
          messages: [
            TW.Cosmos.Proto.Message.create({
              wasmExecuteContractGeneric:
                TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
                  senderAddress: coin.address,
                  contractAddress: toAddress,
                  executeMsg: '{ "deposit": {} }',
                  coins: [
                    TW.Cosmos.Proto.Amount.create({
                      denom: fullDenom,
                      amount: keysignPayload.toAmount,
                    }),
                  ],
                }),
            }),
          ],
          txMemo: memo,
        }
      } else if (memo?.startsWith('unmerge:')) {
        const memoParts = memo.toLowerCase().split(':')
        if (memoParts.length !== 3 || !memoParts[2]) {
          throw new Error(
            'Invalid unmerge memo format. Expected: unmerge:<denom>:<rawShares>'
          )
        }

        const [, , rawShares] = memoParts

        return {
          messages: [
            TW.Cosmos.Proto.Message.create({
              wasmExecuteContractGeneric:
                TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
                  senderAddress: coin.address,
                  contractAddress: toAddress,
                  executeMsg: `{ "withdraw": { "share_amount": "${rawShares}" } }`,
                  coins: [],
                }),
            }),
          ],
          txMemo: memo,
        }
      }

      const getSwapPayload = () => {
        const swapPayload = getKeysignSwapPayload(keysignPayload)
        if (!swapPayload) {
          return null
        }

        return getRecordUnionValue(swapPayload, 'native')
      }

      const swapPayload = getSwapPayload()

      const getDepositAmount = () => {
        if (isDeposit) {
          return shouldBePresent(keysignPayload.toAmount)
        }

        if (
          swapPayload &&
          areEqualCoins(coin, chainFeeCoin[swapPayload.chain])
        ) {
          return swapPayload.fromAmount
        }
      }

      const depositAmount = getDepositAmount()

      if (depositAmount) {
        const depositCoin = TW.Cosmos.Proto.THORChainCoin.create({
          asset: TW.Cosmos.Proto.THORChainAsset.create({
            chain: nativeSwapChainIds[chain as VaultBasedCosmosChain],
            symbol: coin.ticker,
            ticker: coin.ticker,
            synth: false,
          }),
          amount: depositAmount,
          decimals: new Long(coin.decimals),
        })

        return {
          messages: [
            TW.Cosmos.Proto.Message.create({
              thorchainDepositMessage:
                TW.Cosmos.Proto.Message.THORChainDeposit.create({
                  signer: fromAddress,
                  memo,
                  coins: [depositCoin],
                }),
            }),
          ],
          // That doesn't make sense, but iOS and Android have this logic.
          txMemo: chain === Chain.MayaChain ? memo : swapPayload ? '' : memo,
        }
      }

      return {
        messages: [
          TW.Cosmos.Proto.Message.create({
            thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
              fromAddress,
              amounts: [
                TW.Cosmos.Proto.Amount.create(
                  getCosmosCoinAmount(keysignPayload)
                ),
              ],
              toAddress: toTwAddress({
                address: toAddress,
                walletCore,
                chain,
              }),
            }),
          }),
        ],
        txMemo: memo,
      }
    },
  })

  const getFee = () => {
    const getFeeAmounts = () => {
      if (chainKind !== 'ibcEnabled') return

      const { gas } = getRecordUnionValue(chainSpecific, 'ibcEnabled')

      const amounts: TW.Cosmos.Proto.Amount[] = [
        TW.Cosmos.Proto.Amount.create({
          amount: gas.toString(),
          denom: cosmosFeeCoinDenom[chain],
        }),
      ]

      if (areEqualCoins(coin, { chain: Chain.TerraClassic, id: 'uusd' })) {
        amounts.push(
          TW.Cosmos.Proto.Amount.create({
            denom: coin.id,
            amount: '1000000',
          })
        )
      }

      return amounts
    }

    return TW.Cosmos.Proto.Fee.create({
      gas: Long.fromBigInt(getCosmosGasLimit(coin)),
      amounts: getFeeAmounts(),
    })
  }

  const { accountNumber, sequence } = getRecordUnionValue(chainSpecific)

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey: getKeysignTwPublicKey(keysignPayload),
    signingMode: TW.Cosmos.Proto.SigningMode.Protobuf,
    chainId: getTwChainId({ walletCore, chain }),
    accountNumber: new Long(Number(accountNumber)),
    sequence: new Long(Number(sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: txMemo,
    messages,
    fee: getFee(),
  })

  return [TW.Cosmos.Proto.SigningInput.encode(input).finish()]
}
