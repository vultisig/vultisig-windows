import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../swap/getKeysignSwapPayload'
import { TxInputDataResolver } from './TxInputDataResolver'

export const getTronTxInputData: TxInputDataResolver<'tron'> = ({
  keysignPayload,
}) => {
  const tronSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tronSpecific'
  )
  const isNative = keysignPayload.coin?.isNativeToken
  const swapPayload = getKeysignSwapPayload(keysignPayload)

  // handle Thorchain-native swap payloads
  if (swapPayload) {
    // build the TriggerSmartContract payload for native vs routed swaps
    const trigger = matchRecordUnion(swapPayload, {
      native: ({ fromAmount, vaultAddress }) => {
        const memo = shouldBePresent(keysignPayload.memo)
        return TW.Tron.Proto.TriggerSmartContract.create({
          ownerAddress: keysignPayload?.coin.address ?? '',
          contractAddress: Buffer.from(shouldBePresent(vaultAddress), 'hex'),
          data: Buffer.from(memo, 'utf8'),
          callValue: Long.fromString(fromAmount).toNumber(),
        })
      },
      general: ({ quote }) => {
        const tx = shouldBePresent(quote.tx)
        const dataHex = stripHexPrefix(tx.data ?? '')
        return TW.Tron.Proto.TriggerSmartContract.create({
          ownerAddress: keysignPayload.coin.address ?? '',
          contractAddress: Buffer.from(shouldBePresent(tx.to), 'hex'),
          data: Buffer.from(dataHex, 'hex'),
          callValue: 0,
        })
      },
    })

    const transaction = TW.Tron.Proto.Transaction.create({
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

    const signingInput = TW.Tron.Proto.SigningInput.create({ transaction })
    return [TW.Tron.Proto.SigningInput.encode(signingInput).finish()]
  }

  // fallback: plain TRX or TRC20 transfer
  if (isNative) {
    const contract = TW.Tron.Proto.TransferContract.create({
      ownerAddress: keysignPayload.coin.address ?? '',
      toAddress: keysignPayload.toAddress,
      amount: Long.fromString(keysignPayload.toAmount ?? '0'),
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
      }),
    })

    return [TW.Tron.Proto.SigningInput.encode(input).finish()]
  } else {
    const amountHex = Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
      'hex'
    )

    const contract = TW.Tron.Proto.TransferTRC20Contract.create({
      ownerAddress: keysignPayload.coin.address ?? '',
      toAddress: keysignPayload.toAddress,
      contractAddress: keysignPayload.coin.contractAddress ?? '',
      amount: amountHex,
    })

    const input = TW.Tron.Proto.SigningInput.create({
      transaction: TW.Tron.Proto.Transaction.create({
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
      }),
    })

    return [TW.Tron.Proto.SigningInput.encode(input).finish()]
  }
}
