import { Chain, CosmosChain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getCosmosGasLimit } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { getCosmosChainKind } from '@core/chain/chains/cosmos/utils/getCosmosChainKind'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { nativeSwapChainIds } from '@core/chain/swap/native/NativeSwapChain'
import {
  THORChainSpecific,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getKeysignSwapPayload } from '../../../swap/getKeysignSwapPayload'
import { getKeysignTwPublicKey } from '../../../tw/getKeysignTwPublicKey'
import { getTwChainId } from '../../../tw/getTwChainId'
import { toTwAddress } from '../../../tw/toTwAddress'
import { getKeysignChain } from '../../../utils/getKeysignChain'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { SigningInputsResolver } from '../../resolver'
import { CosmosChainSpecific, getCosmosChainSpecific } from './chainSpecific'
import { getCosmosCoinAmount } from './coinAmount'

export const getCosmosSigningInputs: SigningInputsResolver<'cosmos'> = ({
  keysignPayload,
  walletCore,
}) => {
  const chain = getKeysignChain<'cosmos'>(keysignPayload)
  const coin = getKeysignCoin<CosmosChain>(keysignPayload)

  const chainKind = getCosmosChainKind(chain)

  const chainSpecific = getCosmosChainSpecific(
    chain,
    keysignPayload.blockchainSpecific
  )

  const { memo, toAddress, signAmino } = keysignPayload

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
    vaultBased: ({ isDeposit, ...rest }) => {
      if (signAmino) {
        const msgs = signAmino.msgs

        const messages = msgs.map(msg => {
          const message = TW.Cosmos.Proto.Message.create({
            rawJsonMessage: {
              type: msg.type,
              value: msg.value,
            },
          })

          return message
        })

        return {
          messages,
          txMemo: memo,
        }
      }
      const txType =
        (rest as Partial<THORChainSpecific>).transactionType ??
        TransactionType.UNSPECIFIED

      const fromAddress = toTwAddress({
        address: coin.address,
        walletCore,
        chain,
      })

      // iOS sometimes attaches an EMPTY wasm payload for memo-based TCY flows.
      const potentialContractPayload =
        keysignPayload.contractPayload?.case === 'wasmExecuteContractPayload'
          ? keysignPayload.contractPayload.value
          : undefined

      const hasMeaningfulWasm =
        txType === TransactionType.GENERIC_CONTRACT &&
        !!potentialContractPayload &&
        !!potentialContractPayload.senderAddress?.trim() &&
        !!potentialContractPayload.contractAddress?.trim() &&
        !!potentialContractPayload.executeMsg?.trim()

      if (hasMeaningfulWasm) {
        return {
          messages: [
            TW.Cosmos.Proto.Message.create({
              wasmExecuteContractGeneric:
                TW.Cosmos.Proto.Message.WasmExecuteContractGeneric.create({
                  senderAddress: potentialContractPayload!.senderAddress,
                  contractAddress: potentialContractPayload!.contractAddress,
                  executeMsg: potentialContractPayload!.executeMsg,
                  coins: potentialContractPayload!.coins ?? [],
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

      if (
        isDeposit ||
        (swapPayload && coin.chain === chain && swapPayload.chain === chain)
      ) {
        const amountStr = isDeposit
          ? (keysignPayload.toAmount ?? '0')
          : swapPayload!.fromAmount

        const isPositive = +/^[0-9]+$/.test(amountStr) && BigInt(amountStr) > 0n

        const depositCoin = TW.Cosmos.Proto.THORChainCoin.create({
          asset: TW.Cosmos.Proto.THORChainAsset.create({
            chain: nativeSwapChainIds[chain as VaultBasedCosmosChain],
            symbol: coin.ticker,
            ticker: coin.ticker,
            synth: false,
          }),
          ...(isPositive
            ? { amount: amountStr, decimals: new Long(coin.decimals) }
            : {}),
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
    if (signAmino) {
      const fee = TW.Cosmos.Proto.Fee.create({
        gas: Long.fromString(signAmino.fee?.gas ?? '0'),
        amounts:
          signAmino.fee?.amount?.map(coin =>
            TW.Cosmos.Proto.Amount.create(coin)
          ) ?? [],
      })

      return fee
    }

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

  const fee = getFee()

  const publicKey = getKeysignTwPublicKey(keysignPayload)
  const chainId = getTwChainId({ walletCore, chain })

  const signingMode = signAmino
    ? TW.Cosmos.Proto.SigningMode.JSON
    : TW.Cosmos.Proto.SigningMode.Protobuf

  const input = TW.Cosmos.Proto.SigningInput.create({
    publicKey,
    signingMode,
    chainId,
    accountNumber: new Long(Number(accountNumber)),
    sequence: new Long(Number(sequence)),
    mode: TW.Cosmos.Proto.BroadcastMode.SYNC,
    memo: txMemo,
    messages,
    fee,
  })

  return [input]
}
