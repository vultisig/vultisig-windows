import { decodeBittensorTxInput } from '@core/mpc/keysign/signingInputs/resolvers/bittensor'
import { getPreSigningOutput } from '@core/mpc/keysign/preSigningOutput'
import { blake2AsU8a } from '@polkadot/util-crypto'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'

import { Chain } from '../../Chain'

type Input = {
  walletCore: WalletCore
  chain: Chain
  txInputData: Uint8Array
}

export const getPreSigningHashes = ({
  walletCore,
  txInputData,
  chain,
}: Input) => {
  // Bittensor: custom signing payload with CheckMetadataHash extension
  if (chain === Chain.Bittensor) {
    const { payload } = decodeBittensorTxInput(txInputData)
    // Substrate: if payload > 256 bytes, hash it; otherwise sign directly
    const toSign =
      payload.length > 256 ? blake2AsU8a(payload, 256) : payload
    return [toSign]
  }

  const output = getPreSigningOutput({
    walletCore,
    txInputData,
    chain,
  })

  if ('preSigningResultV2' in output && output.preSigningResultV2 !== null) {
    const preSigningResultV2 = shouldBePresent(output.preSigningResultV2)
    const sighashes = shouldBePresent(preSigningResultV2.sighashes)
    return without(
      sighashes.map(hash => hash?.sighash),
      null,
      undefined
    )
  }

  if ('hashPublicKeys' in output) {
    return without(
      output.hashPublicKeys.map(hash => hash?.dataHash),
      null,
      undefined
    )
  }

  const { data } = output

  if ('dataHash' in output && output.dataHash.length > 0) {
    return [output.dataHash]
  }

  return [data]
}
