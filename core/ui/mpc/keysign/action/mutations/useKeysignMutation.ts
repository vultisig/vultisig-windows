import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { Tx } from '@core/chain/tx'
import { broadcastTx } from '@core/chain/tx/broadcast'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { decodeTx } from '@core/chain/tx/decode'
import { getTxHash } from '@core/chain/tx/hash'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { generateSignature } from '@core/chain/tx/signature/generateSignature'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignResult } from '@core/mpc/keysign/KeysignResult'
import { getTxInputData } from '@core/mpc/keysign/txInputData'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { customMessageConfig } from '@core/ui/mpc/keysign/customMessage/config'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { useMutation } from '@tanstack/react-query'
import { keccak256 } from 'js-sha3'

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

            const inputs = getTxInputData({
              keysignPayload: payload,
              walletCore,
            })

            const groupedMsgs = inputs.map(txInputData =>
              getPreSigningHashes({
                txInputData,
                walletCore,
                chain,
              }).map(value =>
                hexEncode({
                  value,
                  walletCore,
                })
              )
            )

            const msgs = groupedMsgs.flat().sort()

            const signatureAlgorithm = signatureAlgorithms[getChainKind(chain)]

            const coinType = getCoinType({ walletCore, chain })
            const signatures = await keysignAction({
              msgs,
              signatureAlgorithm,
              coinType,
            })
            const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
              Buffer.from(msg, 'base64').toString('hex')
            )

            const publicKey = getPublicKey({
              chain,
              walletCore,
              hexChainCode: vault.hexChainCode,
              publicKeys: vault.publicKeys,
            })

            const compiledTxs = inputs.map(txInputData =>
              compileTx({
                walletCore,
                txInputData,
                chain,
                publicKey,
                signatures: signaturesRecord,
              })
            )

            const txs: Tx[] = compiledTxs.map(compiledTx => {
              const tx = decodeTx({ chain, compiledTx })

              return {
                ...tx,
                hash: getTxHash({ chain, tx }),
              }
            })

            if (!payload.skipBroadcast) {
              await chainPromises(
                txs.map(tx => () => broadcastTx({ chain, tx, walletCore }))
              )
            }

            return { txs }
          },
          custom: async ({ message }) => {
            const messageToHash = message.startsWith('0x')
              ? Buffer.from(message.slice(2), 'hex')
              : message

            const { chain } = customMessageConfig

            const [signature] = await keysignAction({
              msgs: [keccak256(messageToHash)],
              signatureAlgorithm: signatureAlgorithms[getChainKind(chain)],
              coinType: getCoinType({
                walletCore,
                chain,
              }),
            })

            const signatureFormat = signatureFormats[getChainKind(chain)]

            const result = generateSignature({
              walletCore,
              signature,
              signatureFormat,
            })

            return { signature: Buffer.from(result).toString('hex') }
          },
        }
      )
    },
    ...mutationListener,
  })
}
