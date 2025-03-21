import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { executeTx } from '@core/chain/tx/execute'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { generateSignature } from '@core/chain/tx/signature/generateSignature'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { MPCKeysign } from '@core/mpc/mpcKeysign'
import { MpcLib } from '@core/mpc/mpcLib'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { useMutation } from '@tanstack/react-query'
import { keccak256 } from 'js-sha3'

import { tss } from '../../../../../wailsjs/go/models'
import { Keysign } from '../../../../../wailsjs/go/tss/TssService'
import { useMpcPeers } from '../../../../mpc/peers/state/mpcPeers'
import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useIsInitiatingDevice } from '../../../../mpc/state/isInitiatingDevice'
import { getVaultPublicKey } from '../../../publicKey/getVaultPublicKey'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../../state/currentVault'
import { customMessageConfig } from '../../customMessage/config'
import { getKeysignChain } from '../../utils/getKeysignChain'
import { getTxInputData } from '../../utils/getTxInputData'

export const useKeysignMutation = (payload: KeysignMessagePayload) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const serverUrl = useMpcServerUrl()
  const isInitiateDevice = useIsInitiatingDevice()
  const peers = useMpcPeers()

  return useMutation({
    mutationFn: async () => {
      return matchRecordUnion<KeysignMessagePayload, Promise<string>>(payload, {
        keysign: async payload => {
          const chain = getKeysignChain(payload)

          const inputs = await getTxInputData({
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

          const tssType = signatureAlgorithms[getChainKind(chain)]

          const coinType = getCoinType({ walletCore, chain })
          const libType = vault.lib_type as MpcLib
          let signatures: Array<tss.KeysignResponse> = []
          if (libType == 'GG20') {
            signatures = await Keysign(
              vault,
              msgs,
              vault.local_party_id,
              walletCore.CoinTypeExt.derivationPath(coinType),
              sessionId,
              encryptionKeyHex,
              serverUrl,
              tssType
            )
          } else if (libType == 'DKLS') {
            const mpc = new MPCKeysign(
              isInitiateDevice,
              serverUrl,
              sessionId,
              vault.local_party_id,
              [vault.local_party_id, ...peers],
              encryptionKeyHex
            )
            let keyShare = ''
            let keysignPublicKey = ''
            if (tssType == 'ecdsa') {
              keysignPublicKey = vault.public_key_ecdsa
              keyShare = vault.keyshares.find(keyshare => {
                if (keyshare.public_key == vault.public_key_ecdsa) {
                  return true
                }
              })?.keyshare as string
            } else if (tssType == 'eddsa') {
              keysignPublicKey = vault.public_key_eddsa
              keyShare = vault.keyshares.find(keyshare => {
                if (keyshare.public_key == vault.public_key_eddsa) {
                  return true
                }
              })?.keyshare as string
            }
            const result = await mpc.startKeysign(
              keyShare,
              tssType,
              msgs,
              keysignPublicKey,
              walletCore.CoinTypeExt.derivationPath(coinType)
            )
            signatures = result.map(sig => {
              return tss.KeysignResponse.createFrom({
                msg: sig.msg,
                r: sig.r,
                s: sig.s,
                der_signature: sig.der_signature,
                recovery_id: sig.recovery_id,
              })
            })
          }
          const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
            Buffer.from(msg, 'base64').toString('hex')
          )

          const publicKey = await getVaultPublicKey({
            vault,
            chain,
            walletCore,
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

          return getLastItem(hashes)
        },
        custom: async ({ message }) => {
          const derivePath = walletCore.CoinTypeExt.derivationPath(
            getCoinType({ walletCore, chain: customMessageConfig.chain })
          )
          const messageToHash = message.startsWith('0x')
            ? Buffer.from(message.slice(2), 'hex')
            : message
          const [signature] = await Keysign(
            vault,
            [keccak256(messageToHash)],
            vault.local_party_id,
            derivePath,
            sessionId,
            encryptionKeyHex,
            serverUrl,
            signatureAlgorithms[getChainKind(customMessageConfig.chain)]
          )

          const signatureFormat =
            signatureFormats[getChainKind(customMessageConfig.chain)]

          const result = generateSignature({
            walletCore,
            signature,
            signatureFormat,
          })

          return Buffer.from(result).toString('hex')
        },
      })
    },
  })
}
