import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getChainKind } from '@core/chain/ChainKind'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfo } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { Vault } from '@core/ui/vault/Vault'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { WalletCore } from '@trustwallet/wallet-core'
import { toUtf8String } from 'ethers'
import { hexToString } from 'viem'

import { CosmosMsgType } from '../interfaces'
import { CustomTxData } from './customTxData'
import { ParsedTx } from './parsedTx'

type Input = {
  chainSpecific: KeysignChainSpecific
  utxoInfo: UtxoInfo[] | null
  tx: ParsedTx
  vault: Vault
  walletCore: WalletCore
}

export const getKeysignPayload = ({
  chainSpecific,
  utxoInfo,
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

  const toAmount = matchRecordUnion<CustomTxData, string>(customTxData, {
    regular: ({ transactionDetails }) =>
      BigInt(parseInt(transactionDetails.amount?.amount ?? '0')).toString(),
    solana: tx => getRecordUnionValue(tx).inAmount.toString(),
    psbt: psbt => getPsbtTransferInfo(psbt, coin.address).sendAmount.toString(),
  })

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
          return toUtf8String(data)
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
        transactionDetails.cosmosMsgPayload?.case ===
        CosmosMsgType.MSG_EXECUTE_CONTRACT
      ) {
        const msgPayload = transactionDetails.cosmosMsgPayload.value

        return {
          case: 'wasmExecuteContractPayload',
          value: create(WasmExecuteContractPayloadSchema, {
            contractAddress: msgPayload.contract,
            executeMsg: msgPayload.msg,
            senderAddress: msgPayload.sender,
            coins: msgPayload.funds,
          }),
        }
      }
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
    toAmount,
    coin: fromCoin,
    blockchainSpecific: chainSpecific,
    utxoInfo: utxoInfo ?? undefined,
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    skipBroadcast,
    memo,
    contractPayload,
    swapPayload,
  })
}
