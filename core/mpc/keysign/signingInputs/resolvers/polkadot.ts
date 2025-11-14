import { getCoinType } from '@core/chain/coin/coinType'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '../../utils/getKeysignChain'
import { resolvePolkadotToAddress } from '../../utils/resolvePolkadotToAddress'
import { SigningInputsResolver } from '../resolver'

export const getPolkadotSigningInputs: SigningInputsResolver<'polkadot'> = ({
  keysignPayload,
  walletCore,
}) => {
  const chain = getKeysignChain(keysignPayload)
  const toAddress = resolvePolkadotToAddress({
    keysignPayload,
    walletCore,
  })

  const {
    recentBlockHash,
    nonce,
    currentBlockNumber,
    specVersion,
    transactionVersion,
    genesisHash,
  } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'polkadotSpecific'
  )

  // Amount: converted to hexadecimal, stripped of '0x'
  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
    'hex'
  )

  const callIndices = TW.Polkadot.Proto.CallIndices.create({
    custom: TW.Polkadot.Proto.CustomCallIndices.create({
      moduleIndex: 10,
      methodIndex: 0,
    }),
  })

  const assetTransfer = TW.Polkadot.Proto.Balance.AssetTransfer.create({
    callIndices,
    toAddress,
    value: new Uint8Array(amountHex),
    assetId: 0,
    feeAssetId: 0,
  })

  const balance = TW.Polkadot.Proto.Balance.create({
    assetTransfer,
  })

  const nonceLong =
    nonce == BigInt(0) ? Long.ZERO : Long.fromString(nonce.toString())
  const currentBlockNumberLong = Long.fromString(currentBlockNumber)
  const periodLong = Long.fromString('64')

  const era = TW.Polkadot.Proto.Era.create({
    blockNumber: currentBlockNumberLong,
    period: periodLong,
  })

  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const hexToBytes = (hex: string): Uint8Array =>
    new Uint8Array(Buffer.from(stripHexPrefix(hex), 'hex'))

  const ss58Prefix = walletCore.CoinTypeExt.ss58Prefix(coinType)
  const input = TW.Polkadot.Proto.SigningInput.create({
    genesisHash: hexToBytes(genesisHash),
    blockHash: hexToBytes(recentBlockHash),
    nonce: nonceLong,
    specVersion: specVersion,
    transactionVersion: transactionVersion,
    network: ss58Prefix,
    era: era,
    balanceCall: balance,
  })

  return [input]
}
