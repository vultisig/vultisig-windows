import { getCoinType } from '@core/chain/coin/coinType'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { GetPreSignedInputDataInput } from './PreSignedInputDataResolver'

export const getPolkadotPreSignedInputData = ({
  keysignPayload,
  walletCore,
  chain,
  chainSpecific,
}: GetPreSignedInputDataInput<'polkadotSpecific'>) => {
  const {
    recentBlockHash,
    nonce,
    currentBlockNumber,
    specVersion,
    transactionVersion,
    genesisHash,
  } = chainSpecific

  // Amount: converted to hexadecimal, stripped of '0x'
  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(keysignPayload.toAmount))),
    'hex'
  )

  const t = TW.Polkadot.Proto.Balance.Transfer.create({
    toAddress: keysignPayload.toAddress,
    value: new Uint8Array(amountHex),
    memo: keysignPayload.memo || '',
  })

  const balance = TW.Polkadot.Proto.Balance.create({
    transfer: t,
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

  return TW.Polkadot.Proto.SigningInput.encode(input).finish()
}
