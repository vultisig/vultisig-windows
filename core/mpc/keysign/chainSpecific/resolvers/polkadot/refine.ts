import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { polkadotRpcUrl } from '@core/chain/chains/polkadot/client'
import { getCoinType } from '@core/chain/coin/coinType'
import { decodeSigningOutput } from '@core/chain/tw/signingOutput'
import { getPreSigningOutput } from '@core/mpc/keysign/preSigningOutput'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { PolkadotSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignChain } from '../../../utils/getKeysignChain'

type RefinePolkadotChainSpecificInput = {
  keysignPayload: KeysignPayload
  chainSpecific: PolkadotSpecific
  walletCore: WalletCore
}

export const refinePolkadotChainSpecific = async ({
  keysignPayload,
  chainSpecific,
  walletCore,
}: RefinePolkadotChainSpecificInput): Promise<PolkadotSpecific> => {
  const chain = getKeysignChain(keysignPayload)
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const payloadWithChainSpecific = create(KeysignPayloadSchema, {
    ...keysignPayload,
    blockchainSpecific: {
      case: 'polkadotSpecific',
      value: chainSpecific,
    },
  })

  const [txInputData] = getEncodedSigningInputs({
    keysignPayload: payloadWithChainSpecific,
    walletCore,
  })

  const preSigningOutput = getPreSigningOutput({
    walletCore,
    txInputData,
    chain: Chain.Polkadot,
  })

  if (preSigningOutput.errorMessage) {
    throw new Error(preSigningOutput.errorMessage)
  }

  const dummyPrivateKey = walletCore.PrivateKey.create()
  const dummyPublicKey = dummyPrivateKey.getPublicKeyEd25519()
  const publicKeyData = dummyPublicKey.data()

  const allSignatures = walletCore.DataVector.create()
  const publicKeys = walletCore.DataVector.create()

  const zeroSignature = new Uint8Array(64)
  allSignatures.add(zeroSignature)
  publicKeys.add(publicKeyData)

  const compiledWithSignature =
    walletCore.TransactionCompiler.compileWithSignatures(
      coinType,
      txInputData,
      allSignatures,
      publicKeys
    )

  const output = decodeSigningOutput(Chain.Polkadot, compiledWithSignature)

  const serializedTransaction = Buffer.from(output.encoded).toString('hex')
  const hexWithPrefix = ensureHexPrefix(serializedTransaction)

  const { result } = await queryUrl<{
    result: { partialFee: string }
  }>(polkadotRpcUrl, {
    body: {
      jsonrpc: '2.0',
      method: 'payment_queryInfo',
      params: [hexWithPrefix],
      id: 1,
    },
  })

  return {
    ...chainSpecific,
    gas: BigInt(result.partialFee),
  }
}
