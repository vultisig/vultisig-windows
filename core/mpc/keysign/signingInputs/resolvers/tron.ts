import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../../swap/getKeysignSwapPayload'
import { SigningInputsResolver } from '../resolver'

const createTronBlockHeader = (tronSpecific: {
  blockHeaderTimestamp: bigint | number | string
  blockHeaderNumber: bigint | number | string
  blockHeaderVersion: bigint | number | string
  blockHeaderTxTrieRoot: string
  blockHeaderParentHash: string
  blockHeaderWitnessAddress: string
}) =>
  TW.Tron.Proto.BlockHeader.create({
    timestamp: Long.fromString(tronSpecific.blockHeaderTimestamp.toString()),
    number: Long.fromString(tronSpecific.blockHeaderNumber.toString()),
    version: Number(tronSpecific.blockHeaderVersion.toString()),
    txTrieRoot: Buffer.from(tronSpecific.blockHeaderTxTrieRoot, 'hex'),
    parentHash: Buffer.from(tronSpecific.blockHeaderParentHash, 'hex'),
    witnessAddress: Buffer.from(tronSpecific.blockHeaderWitnessAddress, 'hex'),
  })

export const getTronSigningInputs: SigningInputsResolver<'tron'> = ({
  keysignPayload,
}) => {
  const tronSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tronSpecific'
  )

  const memo = keysignPayload.memo ?? ''

  // FreezeBalanceV2 (Stake 2.0) — dispatch based on memo prefix
  if (memo.startsWith('FREEZE:')) {
    const resource = memo.slice('FREEZE:'.length)
    if (resource !== 'BANDWIDTH' && resource !== 'ENERGY') {
      throw new Error(`Invalid TRON resource type: ${resource}`)
    }

    const frozenBalance = Long.fromString(
      shouldBePresent(keysignPayload?.toAmount)
    )
    if (frozenBalance.lessThanOrEqual(Long.ZERO)) {
      throw new Error('Frozen balance must be strictly positive')
    }

    const input = TW.Tron.Proto.SigningInput.create({
      transaction: TW.Tron.Proto.Transaction.create({
        freezeBalanceV2: TW.Tron.Proto.FreezeBalanceV2Contract.create({
          ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
          frozenBalance,
          resource,
        }),
        timestamp: Long.fromString(tronSpecific.timestamp.toString()),
        expiration: Long.fromString(tronSpecific.expiration.toString()),
        feeLimit: Long.fromString(tronSpecific.gasEstimation.toString()),
        blockHeader: createTronBlockHeader(tronSpecific),
      }),
    })

    return [input]
  }

  // UnfreezeBalanceV2 (Stake 2.0) — dispatch based on memo prefix
  if (memo.startsWith('UNFREEZE:')) {
    const resource = memo.slice('UNFREEZE:'.length)
    if (resource !== 'BANDWIDTH' && resource !== 'ENERGY') {
      throw new Error(`Invalid TRON resource type: ${resource}`)
    }

    const unfreezeBalance = Long.fromString(
      shouldBePresent(keysignPayload?.toAmount)
    )
    if (unfreezeBalance.lessThanOrEqual(Long.ZERO)) {
      throw new Error('Unfreeze balance must be strictly positive')
    }

    const input = TW.Tron.Proto.SigningInput.create({
      transaction: TW.Tron.Proto.Transaction.create({
        unfreezeBalanceV2: TW.Tron.Proto.UnfreezeBalanceV2Contract.create({
          ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
          unfreezeBalance,
          resource,
        }),
        timestamp: Long.fromString(tronSpecific.timestamp.toString()),
        expiration: Long.fromString(tronSpecific.expiration.toString()),
        feeLimit: Long.fromString(tronSpecific.gasEstimation.toString()),
        blockHeader: createTronBlockHeader(tronSpecific),
      }),
    })

    return [input]
  }

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

    return [input]
  }

  if (swapPayload) {
    return matchRecordUnion(swapPayload, {
      native: ({ fromCoin, vaultAddress }) => {
        const { isNativeToken } = shouldBePresent(fromCoin)

        if (isNativeToken) {
          const contract = TW.Tron.Proto.TransferContract.create({
            ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
            toAddress: shouldBePresent(vaultAddress),
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
                number: Long.fromString(
                  tronSpecific.blockHeaderNumber.toString()
                ),
                version: Number(tronSpecific.blockHeaderVersion.toString()),
                txTrieRoot: Buffer.from(
                  tronSpecific.blockHeaderTxTrieRoot,
                  'hex'
                ),
                parentHash: Buffer.from(
                  tronSpecific.blockHeaderParentHash,
                  'hex'
                ),
                witnessAddress: Buffer.from(
                  tronSpecific.blockHeaderWitnessAddress,
                  'hex'
                ),
              }),
              expiration: Long.fromString(tronSpecific.expiration.toString()),
              memo: keysignPayload.memo,
            }),
          })

          return [input]
        }

        const amountHex = Buffer.from(
          stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
          'hex'
        )

        const contract = TW.Tron.Proto.TransferTRC20Contract.create({
          ownerAddress: shouldBePresent(keysignPayload?.coin?.address),
          toAddress: shouldBePresent(vaultAddress),
          contractAddress: shouldBePresent(
            keysignPayload?.coin?.contractAddress
          ),
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
              number: Long.fromString(
                tronSpecific.blockHeaderNumber.toString()
              ),
              version: Number(tronSpecific.blockHeaderVersion.toString()),
              txTrieRoot: Buffer.from(
                tronSpecific.blockHeaderTxTrieRoot,
                'hex'
              ),
              parentHash: Buffer.from(
                tronSpecific.blockHeaderParentHash,
                'hex'
              ),
              witnessAddress: Buffer.from(
                tronSpecific.blockHeaderWitnessAddress,
                'hex'
              ),
            }),
            expiration: Long.fromString(tronSpecific.expiration.toString()),
            memo: keysignPayload.memo,
          }),
        })

        return [input]
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

    return [input]
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

  return [input]
}
