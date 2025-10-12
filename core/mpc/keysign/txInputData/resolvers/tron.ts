import { toTronData } from '@core/chain/chains/tron/tx/toTronData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../../swap/getKeysignSwapPayload'
import { TxInputDataResolver } from '../resolver'

export const getTronTxInputData: TxInputDataResolver<'tron'> = ({
  keysignPayload,
}) => {
  const tronSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tronSpecific'
  )

  const isNative = keysignPayload?.coin?.isNativeToken
  const swapPayload = getKeysignSwapPayload(keysignPayload)

  const contractPayload = keysignPayload.contractPayload

  if (contractPayload && contractPayload.value && contractPayload.case) {
    const contract:
      | { transfer: TW.Tron.Proto.TransferContract }
      | {
          triggerSmartContract: TW.Tron.Proto.TriggerSmartContract
          feeLimit: Long
        }
      | { transferAsset: TW.Tron.Proto.TransferAssetContract; feeLimit: Long } =
      matchDiscriminatedUnion(contractPayload, 'case', 'value', {
        tronTransferContractPayload: value => {
          return {
            transfer: TW.Tron.Proto.TransferContract.create({
              ownerAddress: value.ownerAddress,
              toAddress: value.toAddress,
              amount: Long.fromString(value.amount),
            }),
          }
        },
        tronTriggerSmartContractPayload: value => {
          return {
            triggerSmartContract: TW.Tron.Proto.TriggerSmartContract.create({
              ownerAddress: value.ownerAddress,
              contractAddress: value.contractAddress,
              callValue: value.callValue
                ? Long.fromString(value.callValue?.toString())
                : undefined,
              data: value.data ? Buffer.from(value.data, 'hex') : undefined,
              callTokenValue: value.callTokenValue
                ? Long.fromString(value.callTokenValue?.toString())
                : undefined,
              tokenId: value.tokenId
                ? Long.fromString(value.tokenId?.toString())
                : undefined,
            }),
            feeLimit: Long.fromString(tronSpecific.gasEstimation.toString()),
          }
        },
        tronTransferAssetContractPayload: value => {
          return {
            transferAsset: TW.Tron.Proto.TransferAssetContract.create({
              ownerAddress: value.ownerAddress,
              toAddress: value.toAddress,
              amount: Long.fromString(value.amount),
              assetName: value.assetName,
            }),
            feeLimit: Long.fromString(tronSpecific.gasEstimation.toString()),
          }
        },
        wasmExecuteContractPayload: () => {
          throw new Error(
            'WASM execute contract payload not supported for Tron'
          )
        },
      })

    const input = TW.Tron.Proto.SigningInput.create({
      transaction: TW.Tron.Proto.Transaction.create({
        ...contract,
        timestamp: Long.fromString(tronSpecific.timestamp.toString()),
        blockHeader: TW.Tron.Proto.BlockHeader.create({
          timestamp: Long.fromString(
            tronSpecific.blockHeaderTimestamp.toString()
          ),
          number: Long.fromString(tronSpecific.blockHeaderNumber.toString()),
          version: Number(tronSpecific.blockHeaderVersion.toString()),
          txTrieRoot: Buffer.from(tronSpecific.blockHeaderTxTrieRoot, 'hex'),
          parentHash: Buffer.from(tronSpecific.blockHeaderParentHash, 'hex'),
          witnessAddress: Buffer.from(
            tronSpecific.blockHeaderWitnessAddress,
            'hex'
          ),
        }),
        expiration: Long.fromString(tronSpecific.expiration.toString()),
        memo: keysignPayload.memo,
      }),
    })

    return [TW.Tron.Proto.SigningInput.encode(input).finish()]
  }

  if (swapPayload) {
    return matchRecordUnion(swapPayload, {
      native: ({ fromCoin, fromAmount, vaultAddress }) => {
        const memo = shouldBePresent(keysignPayload.memo)
        const { isNativeToken } = shouldBePresent(fromCoin)

        if (!isNativeToken) {
          throw new Error('TRC20 native swap on TRON not implemented yet')
        }

        const trigger = TW.Tron.Proto.TriggerSmartContract.create({
          ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
          contractAddress: shouldBePresent(vaultAddress),
          data: toTronData(memo),
          callValue: Long.fromString(shouldBePresent(fromAmount)),
        })

        const tx = TW.Tron.Proto.Transaction.create({
          triggerSmartContract: trigger,
          timestamp: Long.fromString(tronSpecific.timestamp.toString()),
          blockHeader: TW.Tron.Proto.BlockHeader.create({
            timestamp: Long.fromString(
              tronSpecific.blockHeaderTimestamp.toString()
            ),
            number: Long.fromString(tronSpecific.blockHeaderNumber.toString()),
            version: Number(tronSpecific.blockHeaderVersion.toString()),
            txTrieRoot: Buffer.from(tronSpecific.blockHeaderTxTrieRoot, 'hex'),
            parentHash: Buffer.from(tronSpecific.blockHeaderParentHash, 'hex'),
            witnessAddress: Buffer.from(
              tronSpecific.blockHeaderWitnessAddress,
              'hex'
            ),
          }),
          expiration: Long.fromString(tronSpecific.expiration.toString()),
        })

        const input = TW.Tron.Proto.SigningInput.create({ transaction: tx })
        return [TW.Tron.Proto.SigningInput.encode(input).finish()]
      },

      general: () => {
        throw new Error('General swap not supported for Tron')
      },
    })
  }

  if (isNative) {
    const contract = TW.Tron.Proto.TransferContract.create({
      ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
      toAddress: shouldBePresent(keysignPayload?.toAddress),
      amount: Long.fromString(shouldBePresent(keysignPayload?.toAmount)),
    })

    const input = TW.Tron.Proto.SigningInput.create({
      transaction: TW.Tron.Proto.Transaction.create({
        transfer: contract,
        timestamp: Long.fromString(tronSpecific.timestamp.toString()),
        blockHeader: TW.Tron.Proto.BlockHeader.create({
          timestamp: Long.fromString(
            tronSpecific.blockHeaderTimestamp.toString()
          ),
          number: Long.fromString(tronSpecific.blockHeaderNumber.toString()),
          version: Number(tronSpecific.blockHeaderVersion.toString()),
          txTrieRoot: Buffer.from(tronSpecific.blockHeaderTxTrieRoot, 'hex'),
          parentHash: Buffer.from(tronSpecific.blockHeaderParentHash, 'hex'),
          witnessAddress: Buffer.from(
            tronSpecific.blockHeaderWitnessAddress,
            'hex'
          ),
        }),
        expiration: Long.fromString(tronSpecific.expiration.toString()),
        memo: keysignPayload.memo,
      }),
    })

    return [TW.Tron.Proto.SigningInput.encode(input).finish()]
  }

  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
    'hex'
  )

  const contract = TW.Tron.Proto.TransferTRC20Contract.create({
    ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
    toAddress: shouldBePresent(keysignPayload?.toAddress),
    contractAddress: shouldBePresent(keysignPayload?.coin?.contractAddress),
    amount: amountHex,
  })

  const input = TW.Tron.Proto.SigningInput.create({
    transaction: TW.Tron.Proto.Transaction.create({
      feeLimit: Long.fromString(tronSpecific.gasEstimation.toString()),
      transferTrc20Contract: contract,
      timestamp: Long.fromString(tronSpecific.timestamp.toString()),
      blockHeader: TW.Tron.Proto.BlockHeader.create({
        timestamp: Long.fromString(
          tronSpecific.blockHeaderTimestamp.toString()
        ),
        number: Long.fromString(tronSpecific.blockHeaderNumber.toString()),
        version: Number(tronSpecific.blockHeaderVersion.toString()),
        txTrieRoot: Buffer.from(tronSpecific.blockHeaderTxTrieRoot, 'hex'),
        parentHash: Buffer.from(tronSpecific.blockHeaderParentHash, 'hex'),
        witnessAddress: Buffer.from(
          tronSpecific.blockHeaderWitnessAddress,
          'hex'
        ),
      }),
      expiration: Long.fromString(tronSpecific.expiration.toString()),
      memo: keysignPayload.memo,
    }),
  })

  return [TW.Tron.Proto.SigningInput.encode(input).finish()]
}
