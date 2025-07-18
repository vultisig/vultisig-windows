import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { executeTx } from '@core/chain/tx/execute'
import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { generateSignature } from '@core/chain/tx/signature/generateSignature'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
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
    mutationFn: async () => {
      return matchRecordUnion<KeysignMessagePayload, Promise<TxResult[]>>(
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

            const hashes = await chainPromises(
              inputs.map(txInputData => async () => {
                const compiledTx = compileTx({
                  walletCore,
                  txInputData,
                  chain,
                  publicKey,
                  signatures: signaturesRecord,
                })

                return executeTx({
                  compiledTx,
                  walletCore,
                  chain,
                })
              })
            )

            return hashes
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

            return [{ txHash: Buffer.from(result).toString('hex') }]
          },
        }
      )
    },
    ...mutationListener,
  })
}
