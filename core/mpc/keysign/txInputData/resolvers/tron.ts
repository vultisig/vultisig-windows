import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { TxInputDataResolver } from '../resolver'

export const getTronTxInputData: TxInputDataResolver<'tron'> = ({
  keysignPayload,
}) => {
  const tronSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tronSpecific'
  )

  const isNative = keysignPayload?.coin?.isNativeToken

  if (isNative) {
    const contract = TW.Tron.Proto.TransferContract.create({
      ownerAddress: keysignPayload?.coin?.address ?? '',
      toAddress: keysignPayload?.toAddress,
      amount: Long.fromString(keysignPayload?.toAmount ?? '0'),
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
  } else {
    const amountHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
      'hex'
    )

    const contract = TW.Tron.Proto.TransferTRC20Contract.create({
      ownerAddress: keysignPayload?.coin?.address ?? '',
      toAddress: keysignPayload?.toAddress,
      contractAddress: keysignPayload?.coin?.contractAddress ?? '',
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
}
