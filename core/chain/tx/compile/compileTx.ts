import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { assembleBittensorExtrinsic } from '@core/chain/chains/bittensor/signing/buildExtrinsic'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { assertSignature } from '@core/chain/utils/assertSignature'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { decodeBittensorTxInput } from '@core/mpc/keysign/signingInputs/resolvers/bittensor'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { generateSignature } from '../signature/generateSignature'

type Input = {
  publicKey: PublicKey
  txInputData: Uint8Array
  signatures: Record<string, KeysignSignature>
  chain: Chain
  walletCore: WalletCore
}

export const compileTx = ({
  publicKey,
  txInputData,
  signatures,
  chain,
  walletCore,
}: Input) => {
  const hashes = getPreSigningHashes({
    walletCore,
    txInputData,
    chain,
  })

  const chainKind = getChainKind(chain)
  const signatureFormat = signatureFormats[chainKind]

  // Bittensor: custom extrinsic assembly with CheckMetadataHash
  if (chain === Chain.Bittensor) {
    const hash = hashes[0]
    const hashHex = Buffer.from(hash).toString('hex')

    const sig = generateSignature({
      walletCore,
      signature: signatures[hashHex],
      signatureFormat,
    })

    assertSignature({
      publicKey,
      message: hash,
      signature: sig,
      signatureFormat,
    })

    const { callData, signedExtra } = decodeBittensorTxInput(txInputData)
    const signerPubkey = new Uint8Array(publicKey.data())

    const extrinsic = assembleBittensorExtrinsic(
      signerPubkey,
      new Uint8Array(sig),
      callData,
      signedExtra
    )

    return TW.Polkadot.Proto.SigningOutput.encode(
      TW.Polkadot.Proto.SigningOutput.create({
        encoded: extrinsic,
      })
    ).finish()
  }

  const allSignatures = walletCore.DataVector.create()
  const publicKeys = walletCore.DataVector.create()

  hashes.forEach(hash => {
    const signature = generateSignature({
      walletCore,
      signature: signatures[Buffer.from(hash).toString('hex')],
      signatureFormat,
    })

    assertSignature({
      publicKey,
      message: hash,
      signature,
      signatureFormat,
    })

    allSignatures.add(signature)

    if (chainKind !== 'evm') {
      publicKeys.add(publicKey.data())
    }
  })

  const coinType = getCoinType({
    chain,
    walletCore,
  })

  return walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  )
}
