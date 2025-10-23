import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getChainKind } from '@core/chain/ChainKind'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { FeeQuote } from '@core/chain/feeQuote/core'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { KeysignTxData } from '@core/mpc/keysign/txData/core'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  TronTransferAssetContractPayloadSchema,
  TronTransferContractPayloadSchema,
  TronTriggerSmartContractPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/tron_contract_payload_pb'
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { Vault } from '@core/ui/vault/Vault'
import { attempt } from '@lib/utils/attempt'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { WalletCore } from '@trustwallet/wallet-core'
import { toUtf8String } from 'ethers'
import { hexToString } from 'viem'

import { getTxAmount } from './amount'
import { CustomTxData } from './customTxData'
import { ParsedTx } from './parsedTx'

type Input = {
  keysignTxData: KeysignTxData
  feeQuote: FeeQuote
  tx: ParsedTx
  vault: Vault
  walletCore: WalletCore
}

export const getKeysignPayload = ({
  keysignTxData,
  feeQuote,
  tx,
  vault,
  walletCore,
}: Input) => {
  const { coin, customTxData, skipBroadcast } = tx
  const { chain } = coin

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  const blockchainSpecific = buildChainSpecific({
    chain,
    txData: keysignTxData,
    feeQuote,
  })

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

        if (
          data &&
          getChainKind(chain) === 'evm' &&
          data !== '0x' &&
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
    KeysignPayload['contractPayload'] | undefined
  >(customTxData, {
    regular: ({ transactionDetails }) => {
      if (
        !transactionDetails.msgPayload ||
        !transactionDetails.msgPayload.case ||
        !transactionDetails.msgPayload.value
      ) {
        return undefined
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
                coins: msgPayload.funds,
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
          '/cosmos.bank.v1beta1.MsgSend': () => undefined,
          '/cosmwasm.wasm.v1.MsgExecuteContract': () => undefined,
          '/ibc.applications.transfer.v1.MsgTransfer': () => undefined,
          'cosmos-sdk/MsgSend': () => undefined,
          'thorchain/MsgSend': () => undefined,
          'thorchain/MsgDeposit': () => undefined,
          '/types.MsgSend': () => undefined,
        }
      )
    },
    solana: () => undefined,
    psbt: () => undefined,
  })

  const swapPayload = matchRecordUnion<
    CustomTxData,
    KeysignPayload['swapPayload'] | undefined
  >(customTxData, {
    regular: () => undefined,
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
        transfer: () => undefined,
      }),
    psbt: () => undefined,
  })

  return create(KeysignPayloadSchema, {
    toAddress,
    toAmount: getTxAmount(tx).toString(),
    coin: fromCoin,
    blockchainSpecific,
    utxoInfo: 'utxoInfo' in keysignTxData ? keysignTxData.utxoInfo : undefined,
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    skipBroadcast,
    memo,
    contractPayload,
    swapPayload,
  })
}
