import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { executeTx } from '@core/chain/tx/execute'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { generateSignature } from '@core/chain/tx/signature/generateSignature'
import { hexEncode } from '@core/chain/utils/walletCore/hexEncode'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getTxInputData } from '@core/mpc/keysign/txInputData'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { customMessageConfig } from '@core/ui/mpc/keysign/customMessage/config'
import { useBlockaidScan } from '@core/ui/security/hooks/useBlockaidScan'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { useMutation } from '@tanstack/react-query'
import { TW } from '@trustwallet/wallet-core'
import { keccak256 } from 'js-sha3'

import { KeysignMutationTxResult } from '../../types/KeysignMutationTxResult'

export const useKeysignMutation = (payload: KeysignMessagePayload) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const { scanTransaction } = useBlockaidScan()

  const keysignAction = useKeysignAction()
  const mutationListener = useKeysignMutationListener()

  return useMutation({
    mutationFn: async () => {
      return matchRecordUnion<
        KeysignMessagePayload,
        Promise<KeysignMutationTxResult[]>
      >(payload, {
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

          const hashesNested = await chainPromises(
            inputs.map(txInputData => async () => {
              const compiledTx = compileTx({
                walletCore,
                txInputData,
                chain,
                publicKey,
                signatures: signaturesRecord,
              })

              // Get account address for Blockaid scan
              const coin = getKeysignCoin(payload)
              const account_address = coin.address

              // Get transaction data for Blockaid scan
              let rawTx: string | undefined = undefined
              if (getChainKind(chain) === 'evm') {
                const { encoded } =
                  TW.Ethereum.Proto.SigningOutput.decode(compiledTx)
                rawTx = walletCore.HexCoding.encode(encoded)
              } else {
                // For non-EVM chains, use the compiled transaction as raw data
                rawTx = walletCore.HexCoding.encode(compiledTx)
              }

              // Use dedicated blockaid scan hook
              const { scanResult, scanUnavailable, error } =
                await scanTransaction({
                  chain,
                  accountAddress: account_address,
                  rawTx,
                  metadata: { domain: 'https://vultisig.com' },
                })

              // Handle blockaid errors with proper error handling
              if (error) {
                // Re-throw BlockaidError with proper type information
                throw error
              }

              const txResult = await executeTx({
                compiledTx,
                walletCore,
                chain,
              })

              return {
                ...txResult,
                scanResult: scanResult || undefined,
                scanUnavailable,
              } as KeysignMutationTxResult
            })
          )
          const hashes = hashesNested.flat()
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
      })
    },
    ...mutationListener,
  })
}
