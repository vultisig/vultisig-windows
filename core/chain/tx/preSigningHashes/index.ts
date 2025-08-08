import { Chain } from '@core/chain/Chain'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { getCoinType } from '../../coin/coinType'

type Input = {
  walletCore: WalletCore
  chain: Chain
  txInputData: Uint8Array
}

const decoders: Record<
  ChainKind,
  (
    preHashes: Uint8Array
  ) =>
    | TW.Bitcoin.Proto.PreSigningOutput
    | TW.Solana.Proto.PreSigningOutput
    | TW.TxCompiler.Proto.PreSigningOutput
> = {
  utxo: TW.Bitcoin.Proto.PreSigningOutput.decode,
  solana: TW.Solana.Proto.PreSigningOutput.decode,
  evm: TW.TxCompiler.Proto.PreSigningOutput.decode,
  cosmos: TW.TxCompiler.Proto.PreSigningOutput.decode,
  polkadot: TW.TxCompiler.Proto.PreSigningOutput.decode,
  ton: TW.TxCompiler.Proto.PreSigningOutput.decode,
  sui: TW.TxCompiler.Proto.PreSigningOutput.decode,
  ripple: TW.TxCompiler.Proto.PreSigningOutput.decode,
  tron: TW.TxCompiler.Proto.PreSigningOutput.decode,
  cardano: TW.TxCompiler.Proto.PreSigningOutput.decode,
}

export const getPreSigningHashes = ({
  walletCore,
  txInputData,
  chain,
}: Input): Uint8Array[] => {
  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    getCoinType({ walletCore, chain }),
    txInputData
  )

  const chainKind = getChainKind(chain)
  const decoder = decoders[chainKind]
  const output = decoder(preHashes)

  if (chainKind !== 'solana') {
    assertErrorMessage(output.errorMessage)
  }

  if ('hashPublicKeys' in output && Array.isArray(output.hashPublicKeys)) {
    const hashes = output.hashPublicKeys
      .map(h => h?.dataHash)
      .filter((x): x is Uint8Array => x != null && x.length > 0)
      .sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)))

    if (hashes.length === 0) {
      throw new Error(`No pre-signing hashes produced (hashPublicKeys empty)`)
    }
    return hashes
  }

  if ('dataHash' in output && output.dataHash && output.dataHash.length > 0) {
    return [output.dataHash]
  }

  if ('data' in output && output.data && output.data.length > 0) {
    return [output.data]
  }

  throw new Error(`No pre-signing hashes produced for chainKind=${chainKind}`)
}
