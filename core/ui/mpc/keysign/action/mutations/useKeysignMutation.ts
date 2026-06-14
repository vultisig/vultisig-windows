import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from '@core/ui/mpc/keysign/customMessage/chains'
import { constructPolkadotSigningPayload } from '@core/ui/polkadot/dapp/constructSigningPayload'
import { PolkadotSignerPayloadJSON } from '@core/ui/polkadot/dapp/PolkadotSignerPayload'
import {
  buildQBTCSignDoc,
  buildQBTCSignedTxFromDirect,
} from '@core/ui/qbtc/dapp/buildQBTCSignedTxFromDirect'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { fromBase64 } from '@cosmjs/encoding'
import { sha256 } from '@noble/hashes/sha2.js'
import { useMutation } from '@tanstack/react-query'
import { Chain, OtherChain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { signatureAlgorithms } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@vultisig/core-chain/signing/SignatureFormat'
import {
  decodeSigningOutput,
  deserializeSigningOutput,
} from '@vultisig/core-chain/tw/signingOutput'
import { Tx } from '@vultisig/core-chain/tx'
import { broadcastTx } from '@vultisig/core-chain/tx/broadcast'
import { getTxHash } from '@vultisig/core-chain/tx/hash'
import {
  getQBTCPreSignedImageHash,
  getQBTCSignedTransaction,
} from '@vultisig/core-mpc/chains/cosmos/qbtc/QBTCHelper'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignResult } from '@vultisig/core-mpc/keysign/KeysignResult'
import { getEncodedSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { compileTx } from '@vultisig/core-mpc/tx/compile/compileTx'
import { getPreSigningHashes } from '@vultisig/core-mpc/tx/preSigningHashes'
import { generateSignature } from '@vultisig/core-mpc/tx/signature/generateSignature'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { chainPromises } from '@vultisig/lib-utils/promise/chainPromises'
import { recordFromItems } from '@vultisig/lib-utils/record/recordFromItems'

import {
  getCowSwapKeysignData,
  signCowSwapOrder,
} from '../../cowswap/cowSwapKeysign'
import { getCustomMessageHex } from '../../customMessage/getCustomMessageHex'
import {
  getCachedSignature,
  setCachedSignature,
} from '../../customMessage/signatureCache'
import { useKeysignRequestOrigin } from '../../state/keysignRequestOrigin'
import { getCosmosKeplrBridgeTxHash } from '../../tx/getCosmosKeplrBridgeTxHash'

export const useKeysignMutation = (payload: KeysignMessagePayload) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  // dApp origin for the custom-message signature cache; undefined for in-app
  // keysign flows. See signatureCache.ts.
  const requestOrigin = useKeysignRequestOrigin()

  const keysignAction = useKeysignAction()
  const mutationListener = useKeysignMutationListener()

  return useMutation({
    mutationFn: async (): Promise<KeysignResult> => {
      return matchRecordUnion<KeysignMessagePayload, Promise<KeysignResult>>(
        payload,
        {
          keysign: async payload => {
            const chain = getKeysignChain(payload)

            // CowSwap RFQ: off-chain order signed via EIP-712 and submitted to
            // the orderbook instead of broadcast. Diverges from every chain tx
            // path, so handle it before the standard flow.
            const cowswapData = getCowSwapKeysignData(payload)
            if (cowswapData) {
              return signCowSwapOrder({
                payload,
                cowswapData,
                chain,
                walletCore,
                vault,
                keysignAction,
              })
            }

            // QBTC uses MLDSA keys — bypass WalletCore entirely
            if (chain === 'QBTC') {
              const signatureAlgorithm = getSignatureAlgorithm(chain)
              const coinType = getCoinType({ walletCore, chain })

              // dApp signDirect path (`sign_and_broadcast`): the payload
              // already carries proto-encoded bodyBytes + authInfoBytes that
              // wrap arbitrary Cosmos SDK messages. Sign the SignDoc derived
              // from those bytes directly, then re-assemble the TxRaw — no
              // per-typeUrl branching required.
              if (payload.signData.case === 'signDirect') {
                const directValue = payload.signData.value
                const bodyBytes = fromBase64(directValue.bodyBytes)
                const authInfoBytes = fromBase64(directValue.authInfoBytes)
                const accountNumber = BigInt(directValue.accountNumber)

                const signDoc = buildQBTCSignDoc({
                  bodyBytes,
                  authInfoBytes,
                  accountNumber,
                })
                const hashHex = Buffer.from(sha256(signDoc)).toString('hex')

                const [signature] = await keysignAction({
                  msgs: [hashHex],
                  signatureAlgorithm,
                  coinType,
                  chain,
                })

                const { serialized, transactionHash } =
                  buildQBTCSignedTxFromDirect({
                    bodyBytes,
                    authInfoBytes,
                    accountNumber,
                    derSignature: Buffer.from(signature.der_signature, 'hex'),
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

              const cosmosSpecific = getBlockchainSpecificValue(
                payload.blockchainSpecific,
                'cosmosSpecific'
              )

              const msgs = getQBTCPreSignedImageHash({
                keysignPayload: payload,
                cosmosSpecific,
              }).map(bytes => Buffer.from(bytes).toString('hex'))

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

            // Substrate dApp signPayload — bypass TW, sign raw payload
            if (
              isOneOf(chain, [OtherChain.Polkadot, OtherChain.Bittensor]) &&
              payload.memo
            ) {
              const parseResult = attempt(
                () => JSON.parse(payload.memo!) as PolkadotSignerPayloadJSON
              )
              if ('error' in parseResult) {
                // not a dApp payload, fall through to standard flow
              } else if (
                parseResult.data.method &&
                parseResult.data.genesisHash
              ) {
                const signerPayload = parseResult.data
                const signingBytes =
                  constructPolkadotSigningPayload(signerPayload)
                const hexMessage = Buffer.from(signingBytes).toString('hex')

                const signatureAlgorithm = getSignatureAlgorithm(chain)
                const coinType = getCoinType({ walletCore, chain })
                const [signature] = await keysignAction({
                  msgs: [hexMessage],
                  signatureAlgorithm,
                  coinType,
                  chain,
                })

                const signatureBytes = generateSignature({
                  walletCore,
                  signature,
                  signatureFormat: signatureFormats[getChainKind(chain)],
                })

                const tx: Tx = {
                  hash: '',
                  data: deserializeSigningOutput(chain, {
                    encoded: Buffer.from(signatureBytes).toString('base64'),
                  }),
                }

                return { txs: [tx] }
              }
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
                keysignPayload: payload,
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
                keysignPayload: payload,
              })
            )

            const isCosmosDAppSignFlow =
              (payload.signData.case === 'signAmino' ||
                payload.signData.case === 'signDirect') &&
              payload.blockchainSpecific.case === 'cosmosSpecific'

            const txs: Tx[] = await Promise.all(
              compiledTxs.map(async compiledTx => {
                const data = decodeSigningOutput(chain, compiledTx)

                if (isCosmosDAppSignFlow) {
                  const cosmosOutput = decodeSigningOutput(
                    Chain.Cosmos,
                    compiledTx
                  )
                  const signature = cosmosOutput.signature
                  return {
                    data,
                    hash: getCosmosKeplrBridgeTxHash({
                      keysignPayload: payload,
                      signedAminoJson: cosmosOutput.json ?? undefined,
                      signatureBytes: signature
                        ? new Uint8Array(signature)
                        : undefined,
                    }),
                  }
                }

                return {
                  data,
                  hash: await getTxHash({ chain, tx: data }),
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

            // Deterministic-signing middle ground (TEST-ONLY, issue #1147):
            // replay a recent signature for the exact same dApp+vault+message so
            // a single login flow observes a stable signature. RAM-only and
            // short-lived — see signatureCache.ts for the caveats.
            //
            // The cache is scoped per dApp origin so one site cannot read
            // another site's cached signature. If the origin is unknown (e.g.
            // an in-app keysign that is not a dApp request) we skip the cache
            // entirely rather than risk an origin-less, cross-site entry.
            const cacheKeyInput = requestOrigin
              ? {
                  origin: requestOrigin,
                  vaultId: getVaultId(vault),
                  chain,
                  method,
                  hexMessage,
                }
              : undefined

            const cached = cacheKeyInput
              ? await getCachedSignature(cacheKeyInput)
              : undefined
            if (cached) {
              return { signature: cached }
            }

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

            const signatureHex = Buffer.from(result).toString('hex')

            if (cacheKeyInput) {
              await setCachedSignature(cacheKeyInput, signatureHex)
            }

            return {
              signature: signatureHex,
            }
          },
        }
      )
    },
    ...mutationListener,
  })
}
