import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import {
  FeeSettings,
  FeeSettingsChainKind,
} from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { getKeysignUtxoInfo } from '@core/mpc/keysign/utxo/getKeysignUtxoInfo'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  TronTransferAssetContractPayloadSchema,
  TronTransferContractPayloadSchema,
  TronTriggerSmartContractPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/tron_contract_payload_pb'
import {
  CosmosCoinSchema,
  SignAminoSchema,
  WasmExecuteContractPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { attempt } from '@lib/utils/attempt'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { toUtf8String } from 'ethers'
import { hexToString } from 'viem'

import { getTxAmount } from '../core/amount'
import { CustomTxData } from '../core/customTxData'
import { ParsedTx } from '../core/parsedTx'
import { CosmosMsgType, TronMsgType } from '../interfaces'

export type BuildSendTxKeysignPayloadInput = {
  parsedTx: ParsedTx
  feeSettings?: FeeSettings<FeeSettingsChainKind> | null
  publicKey: PublicKey
  walletCore: WalletCore
  vaultId: string
  localPartyId: string
}

const defaultTransactionType = TransactionType.UNSPECIFIED

const cosmosMsgTypeToTransactionType: Record<
  CosmosMsgType | TronMsgType,
  TransactionType
> = {
  [CosmosMsgType.MSG_SEND]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_SEND]: defaultTransactionType,
  [CosmosMsgType.MSG_SEND_URL]: defaultTransactionType,
  [CosmosMsgType.MSG_TRANSFER_URL]: TransactionType.IBC_TRANSFER,
  [CosmosMsgType.MSG_EXECUTE_CONTRACT]: TransactionType.GENERIC_CONTRACT,
  [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: TransactionType.GENERIC_CONTRACT,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: defaultTransactionType,
  [CosmosMsgType.THORCHAIN_MSG_SEND_URL]: defaultTransactionType,
  [TronMsgType.TRON_TRANSFER_CONTRACT]: defaultTransactionType,
  [TronMsgType.TRON_TRIGGER_SMART_CONTRACT]: defaultTransactionType,
  [TronMsgType.TRON_TRANSFER_ASSET_CONTRACT]: defaultTransactionType,
}

export const buildSendTxKeysignPayload = async ({
  parsedTx,
  feeSettings,
  vaultId,
  publicKey,
  walletCore,
  localPartyId,
}: BuildSendTxKeysignPayloadInput) => {
  const { coin, customTxData, skipBroadcast, thirdPartyGasLimitEstimation } =
    parsedTx
  const { chain } = coin

  const getTransactionType = () => {
    if ('regular' in customTxData) {
      const { regular } = customTxData
      const { transactionDetails } = regular
      const { msgPayload } = transactionDetails
      return msgPayload?.case
        ? cosmosMsgTypeToTransactionType[msgPayload.case]
        : defaultTransactionType
    }
  }

  const getTimeoutTimestamp = () => {
    if ('regular' in customTxData) {
      const { regular } = customTxData
      const { transactionDetails } = regular
      const { msgPayload } = transactionDetails

      if (msgPayload?.case === CosmosMsgType.MSG_TRANSFER_URL) {
        return msgPayload.value.timeoutTimestamp
      }
    }
  }

  const getTronMeta = () => {
    if ('regular' in customTxData) {
      const { regular } = customTxData
      const { transactionDetails } = regular
      const { msgPayload } = transactionDetails

      if (
        isChainOfKind(coin.chain, 'tron') &&
        msgPayload &&
        'meta' in msgPayload
      ) {
        return msgPayload.meta
      }
    }
  }

  const hexPublicKey = Buffer.from(publicKey.data()).toString('hex')

  const fromCoin = toCommCoin({
    ...coin,
    hexPublicKey,
  })

  const toAddress = matchRecordUnion<CustomTxData, string | undefined>(
    customTxData,
    {
      regular: ({ transactionDetails }) => transactionDetails.to,
      solana: tx =>
        matchRecordUnion(tx, {
          swap: () => undefined,
          transfer: ({ receiverAddress }) => receiverAddress,
        }),
      psbt: psbt =>
        getPsbtTransferInfo(psbt, coin.address).recipient ?? undefined,
    }
  )

  const memo = matchRecordUnion<CustomTxData, string | undefined>(
    customTxData,
    {
      regular: ({ transactionDetails, isEvmContractCall }) => {
        const { data } = transactionDetails
        console.log('data:', data)
        if (!data || data === '0x') {
          return undefined
        }
        console.log('data:', data)
        if (
          getChainKind(chain) === 'evm' &&
          (!data.startsWith('0x') || !isEvmContractCall)
        ) {
          const result = attempt(() => toUtf8String(data))
          if ('data' in result) {
            return result.data
          }
        }
        return data
      },
      solana: () => undefined,
      psbt: psbt => {
        const { memo } = getPsbtTransferInfo(psbt, coin.address)
        if (memo) {
          return hexToString(`0x${memo}`)
        }
        return undefined
      },
    }
  )

  const contractPayload = matchRecordUnion<
    CustomTxData,
    KeysignPayload['contractPayload']
  >(customTxData, {
    regular: ({ transactionDetails }) => {
      if (
        !transactionDetails.msgPayload ||
        !transactionDetails.msgPayload.case ||
        !transactionDetails.msgPayload.value
      ) {
        return { case: undefined }
      }
      return matchDiscriminatedUnion(
        transactionDetails.msgPayload,
        'case',
        'value',
        {
          'wasm/MsgExecuteContract': (msgPayload: {
            sender: string
            contract: string
            funds: { denom: string; amount: string }[]
            msg: string
          }) => {
            return {
              case: 'wasmExecuteContractPayload',
              value: create(WasmExecuteContractPayloadSchema, {
                contractAddress: msgPayload.contract,
                executeMsg: msgPayload.msg,
                senderAddress: msgPayload.sender,
                coins: msgPayload.funds.map(fund =>
                  create(CosmosCoinSchema, fund)
                ),
              }),
            }
          },
          TransferContract: msgPayload => {
            return {
              case: 'tronTransferContractPayload',
              value: create(TronTransferContractPayloadSchema, {
                toAddress: msgPayload.to_address,
                ownerAddress: msgPayload.owner_address,
                amount: msgPayload.amount.toString(),
              }),
            }
          },
          TriggerSmartContract: msgPayload => {
            return {
              case: 'tronTriggerSmartContractPayload',
              value: create(TronTriggerSmartContractPayloadSchema, {
                ownerAddress: msgPayload.owner_address,
                contractAddress: msgPayload.contract_address,
                callValue: msgPayload.call_value?.toString(),
                callTokenValue: msgPayload.call_token_value?.toString(),
                tokenId: msgPayload.token_id,
                data: msgPayload.data,
              }),
            }
          },
          TransferAssetContract: msgPayload => {
            return {
              case: 'tronTransferAssetContractPayload',
              value: create(TronTransferAssetContractPayloadSchema, {
                toAddress: msgPayload.to_address,
                ownerAddress: msgPayload.owner_address,
                amount: msgPayload.amount.toString(),
                assetName: msgPayload.asset_name,
              }),
            }
          },
          '/cosmos.bank.v1beta1.MsgSend': () => ({ case: undefined }),
          '/cosmwasm.wasm.v1.MsgExecuteContract': () => ({ case: undefined }),
          '/ibc.applications.transfer.v1.MsgTransfer': () => ({
            case: undefined,
          }),
          'cosmos-sdk/MsgSend': () => ({ case: undefined }),
          'thorchain/MsgSend': () => ({ case: undefined }),
          'thorchain/MsgDeposit': () => ({ case: undefined }),
          '/types.MsgSend': () => ({ case: undefined }),
        }
      )
    },
    solana: () => ({ case: undefined }),
    psbt: () => ({ case: undefined }),
  })

  const swapPayload = matchRecordUnion<
    CustomTxData,
    KeysignPayload['swapPayload']
  >(customTxData, {
    regular: () => ({ case: undefined }),
    solana: tx =>
      matchRecordUnion(tx, {
        swap: ({
          outputCoin,
          inAmount,
          outAmount,
          authority,
          data,
          swapProvider,
        }) => ({
          case: 'oneinchSwapPayload',
          value: create(OneInchSwapPayloadSchema, {
            provider: swapProvider,
            fromCoin,
            toCoin: toCommCoin({
              ...outputCoin,
              address: authority,
              hexPublicKey,
            }),
            fromAmount: String(inAmount),
            toAmountDecimal: fromChainAmount(
              outAmount,
              outputCoin.decimals
            ).toString(),
            quote: {
              dstAmount: outAmount,
              tx: {
                data,
                value: '0',
                gasPrice: '0',
                swapFee: '25000',
              },
            },
          }),
        }),
        transfer: () => ({ case: undefined }),
      }),
    psbt: () => ({ case: undefined }),
  })

  const aminoPayload = matchRecordUnion<
    CustomTxData,
    KeysignPayload['signAmino']
  >(customTxData, {
    regular: () => {
      if ('regular' in customTxData) {
        const { regular } = customTxData
        const { transactionDetails } = regular
        const { aminoPayload } = transactionDetails
        if (aminoPayload) {
          return create(SignAminoSchema, {
            fee: aminoPayload.fee,
            msgs: aminoPayload.msgs.map(msg => {
              return {
                type: msg.type,
                value: JSON.stringify(msg.value),
              }
            }),
          })
        }
      }
      return undefined
    },
    solana: () => undefined,
    psbt: () => undefined,
  })

  let keysignPayload = create(KeysignPayloadSchema, {
    toAddress: toAddress ?? '',
    toAmount: getTxAmount(parsedTx).toString(),
    coin: fromCoin,
    utxoInfo: await getKeysignUtxoInfo(coin),
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    skipBroadcast,
    memo,
    contractPayload,
    swapPayload,
    signAmino: aminoPayload,
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    feeSettings: feeSettings ?? undefined,
    thirdPartyGasLimitEstimation,
    isDeposit: matchRecordUnion<CustomTxData, boolean>(customTxData, {
      regular: ({ transactionDetails, isDeposit }) =>
        isDeposit ||
        transactionDetails.msgPayload?.case ===
          CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
      solana: () => false,
      psbt: () => false,
    }),
    transactionType: getTransactionType(),
    timeoutTimestamp: getTimeoutTimestamp(),
    ...getTronMeta(),
    psbt: 'psbt' in customTxData ? customTxData.psbt : undefined,
  })

  if (isChainOfKind(chain, 'utxo')) {
    keysignPayload = refineKeysignUtxo({
      keysignPayload,
      walletCore,
      publicKey,
    })
  }

  return keysignPayload
}
