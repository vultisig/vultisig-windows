import { TronSpecific } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { PreSignedInputDataResolver } from './PreSignedInputDataResolver'

export const getTronPreSignedInputData: PreSignedInputDataResolver<
  'tronSpecific'
> = ({ keysignPayload, chainSpecific }) => {
  const tronSpecific = chainSpecific as unknown as TronSpecific

  //const isNative = keysignPayload?.coin?.isNativeToken

  //if (isNative) {
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
    }),
  })

  return TW.Tron.Proto.SigningInput.encode(input).finish()
  //}
}
