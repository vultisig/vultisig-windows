import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from '@core/ui/mpc/keysign/customMessage/chains'
import { getSignatureAlgorithm } from '@core/ui/utils/getSignatureAlgorithm'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation } from '@tanstack/react-query'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@vultisig/core-chain/signing/SignatureFormat'
import {
  decodeSigningOutput,
  deserializeSigningOutput,
} from '@vultisig/core-chain/tw/signingOutput'
import { Tx } from '@vultisig/core-chain/tx'
import { broadcastTx } from '@vultisig/core-chain/tx/broadcast'
import { compileTx } from '@vultisig/core-chain/tx/compile/compileTx'
import { getTxHash } from '@vultisig/core-chain/tx/hash'
import { getPreSigningHashes } from '@vultisig/core-chain/tx/preSigningHashes'
import { generateSignature } from '@vultisig/core-chain/tx/signature/generateSignature'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignResult } from '@vultisig/core-mpc/keysign/KeysignResult'
import { getEncodedSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { chainPromises } from '@vultisig/lib-utils/promise/chainPromises'
import { recordFromItems } from '@vultisig/lib-utils/record/recordFromItems'

import {
  getQBTCPreSignedImageHash,
  getQBTCSignedTransaction,
} from '../../../../utils/qbtc/QBTCHelper'
import { getCustomMessageHex } from '../../customMessage/getCustomMessageHex'

export const useKeysignMutation = (payload: KeysignMessagePayload) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  const keysignAction = useKeysignAction()
  const mutationListener = useKeysignMutationListener()

  return useMutation({
    mutationFn: async (): Promise<KeysignResult> => {
      return matchRecordUnion<KeysignMessagePayload, Promise<KeysignResult>>(
        payload,
        {
          keysign: async payload => {
            const chain = getKeysignChain(payload)

            // QBTC uses MLDSA keys — bypass WalletCore entirely
            if (chain === 'QBTC') {
              const cosmosSpecific = getBlockchainSpecificValue(
                payload.blockchainSpecific,
                'cosmosSpecific'
              )

              const msgs = getQBTCPreSignedImageHash({
                keysignPayload: payload,
                cosmosSpecific,
              })

              const signatureAlgorithm = getSignatureAlgorithm(chain)
              const coinType = getCoinType({ walletCore, chain })
              const signatures = await keysignAction({
                msgs,
                signatureAlgorithm,
                coinType,
                chain,
              })
              const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
                Buffer.from(msg, 'base64').toString('hex')
              )

              const { serialized, transactionHash } = getQBTCSignedTransaction({
                keysignPayload: payload,
                cosmosSpecific,
                signatures: signaturesRecord,
              })

              const tx: Tx = {
                hash: transactionHash,
                data: deserializeSigningOutput(chain, { serialized }),
              }

              if (!payload.skipBroadcast) {
                await broadcastTx({ chain, tx: tx.data })
              }

              return { txs: [tx] }
            }

            const publicKey = getPublicKey({
              chain,
              walletCore,
              hexChainCode: vault.hexChainCode,
              publicKeys: vault.publicKeys,
              chainPublicKeys: vault.chainPublicKeys,
            })

            const inputs = getEncodedSigningInputs({
              keysignPayload: payload,
              walletCore,
              publicKey,
            })

            const groupedMsgs = inputs.map(txInputData =>
              getPreSigningHashes({
                txInputData,
                walletCore,
                chain,
              }).map(value => Buffer.from(value).toString('hex'))
            )

            const msgs = groupedMsgs.flat().sort()

            const signatureAlgorithm = getSignatureAlgorithm(chain)

            const coinType = getCoinType({ walletCore, chain })
            const signatures = await keysignAction({
              msgs,
              signatureAlgorithm,
              coinType,
              chain,
            })
            const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
              Buffer.from(msg, 'base64').toString('hex')
            )

            const compiledTxs = inputs.map(txInputData =>
              compileTx({
                walletCore,
                txInputData,
                chain,
                publicKey,
                signatures: signaturesRecord,
              })
            )

            const txs: Tx[] = await Promise.all(
              compiledTxs.map(async compiledTx => {
                const data = decodeSigningOutput(chain, compiledTx)
                const hash = await getTxHash({ chain, tx: data })

                return {
                  data,
                  hash,
                }
              })
            )

            if (!payload.skipBroadcast) {
              await chainPromises(
                txs.map(
                  ({ data }) =>
                    () =>
                      broadcastTx({ chain, tx: data })
                )
              )
            }

            return { txs }
          },
          custom: async ({
            method,
            message,
            chain = customMessageDefaultChain,
          }) => {
            if (!isOneOf(chain, customMessageSupportedChains)) {
              throw new Error(`Unsupported chain ${chain}`)
            }

            const chainKind = getChainKind(chain)

            const hexMessage = getCustomMessageHex({ chain, message, method })

            const [signature] = await keysignAction({
              msgs: [hexMessage],
              signatureAlgorithm: signatureAlgorithms[chainKind],
              coinType: getCoinType({ walletCore, chain }),
              chain,
            })

            const result = generateSignature({
              walletCore,
              signature,
              signatureFormat: signatureFormats[chainKind],
            })

            return {
              signature: Buffer.from(result).toString('hex'),
            }
          },
        }
      )
    },
    ...mutationListener,
  })
}
