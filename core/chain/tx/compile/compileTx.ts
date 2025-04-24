import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { assertSignature } from '@core/chain/utils/assertSignature'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { WalletCore } from '@trustwallet/wallet-core'
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

  const allSignatures = walletCore.DataVector.create()
  const publicKeys = walletCore.DataVector.create()

  hashes.forEach(hash => {
    const chainKind = getChainKind(chain)
    const signatureFormat = signatureFormats[chainKind]

    const signature = generateSignature({
      walletCore,
      signature: signatures[hexEncode({ value: hash, walletCore })],
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
