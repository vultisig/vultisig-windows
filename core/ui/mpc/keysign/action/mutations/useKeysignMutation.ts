import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getMoneroBalanceFinaliseOutputsData,
  isMoneroBalanceFinalisePayload,
  parseMoneroBalanceFinaliseMessage,
} from '@core/chain/chains/monero/balanceFinaliseMessage'
import { submitRawTx } from '@core/chain/chains/monero/daemonRpc'
import {
  ensureMoneroScanDataSynced,
  finaliseMoneroOutputsWithKeyImages,
  getMoneroOutputsForKeyImage,
  markMoneroOutputsSpent,
} from '@core/chain/chains/monero/scanner'
import { getShieldingUtxos } from '@core/chain/chains/zcash/getShieldingUtxos'
import { isZcashSaplingAddress } from '@core/chain/chains/zcash/isZcashSaplingAddress'
import {
  getLatestBlock,
  sendTransaction,
} from '@core/chain/chains/zcash/lightwalletd/client'
import { loadSaplingParams } from '@core/chain/chains/zcash/saplingParams'
import { ensureZcashScanDataSynced } from '@core/chain/chains/zcash/scanner'
import { getZcashTxidDigest } from '@core/chain/chains/zcash/txHash'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@core/chain/signing/SignatureFormat'
import { decodeSigningOutput } from '@core/chain/tw/signingOutput'
import { Tx } from '@core/chain/tx'
import { broadcastTx } from '@core/chain/tx/broadcast'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { getTxHash } from '@core/chain/tx/hash'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { generateSignature } from '@core/chain/tx/signature/generateSignature'
import { createFromtKeyImageSession } from '@core/mpc/fromt/fromtSessionFactory'
import { runFromtSpendCeremony } from '@core/mpc/fromt/fromtSpendCeremony'
import { initializeFromt } from '@core/mpc/fromt/initialize'
import { runFroztSession } from '@core/mpc/frozt/froztSession'
import { createFroztSignSessionWithAlpha } from '@core/mpc/frozt/froztSessionFactory'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignResult } from '@core/mpc/keysign/KeysignResult'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { consumeMoneroPreparedTx } from '@core/mpc/keysign/signingInputs/moneroSignableTxStore'
import { prepareMoneroSpendTx } from '@core/mpc/keysign/signingInputs/moneroSpend'
import { consumeZcashPreparedTx } from '@core/mpc/keysign/signingInputs/zcashPreparedTxStore'
import {
  prepareZcashSaplingTx,
  ZcashPreparedTx,
} from '@core/mpc/keysign/signingInputs/zcashSapling'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { deleteMpcRelayMessage } from '@core/mpc/message/relay/delete'
import { getMpcRelayMessages } from '@core/mpc/message/relay/get'
import { sendMpcRelayMessage } from '@core/mpc/message/relay/send'
import {
  fromMpcServerMessage,
  toMpcServerMessage,
} from '@core/mpc/message/server'
import { Vault } from '@core/mpc/vault/Vault'
import { withMpcRetry } from '@core/mpc/withMpcRetry'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useMpcSigners } from '@core/ui/mpc/devices/state/signers'
import {
  KeysignAction,
  useKeysignAction,
} from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from '@core/ui/mpc/keysign/customMessage/chains'
import { useZcashPreparedTx } from '@core/ui/mpc/keysign/state/zcashPreparedTx'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { base64Encode } from '@lib/utils/base64Encode'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { WalletCore } from '@trustwallet/wallet-core'
import {
  frozt_keyshare_bundle_birthday,
  WasmShieldingTxBuilder,
} from 'frozt-wasm'

import { getCustomMessageHex } from '../../customMessage/getCustomMessageHex'

export const useKeysignMutation = (payload: KeysignMessagePayload) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const queryClient = useQueryClient()

  const keysignAction = useKeysignAction()
  const mutationListener = useKeysignMutationListener()

  const isInitiatingDevice = useIsInitiatingDevice()
  const serverUrl = useMpcServerUrl()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const signers = useMpcSigners()
  const zcashPreparedTxFromContext = useZcashPreparedTx()

  return useMutation({
    mutationFn: async (): Promise<KeysignResult> => {
      return matchRecordUnion<KeysignMessagePayload, Promise<KeysignResult>>(
        payload,
        {
          keysign: async payload => {
            const chain = getKeysignChain(payload)

            if (chain === Chain.ZcashSapling) {
              await initializeFrozt()
              const { frozt_keyshare_bundle_key_package } =
                await import('frozt-wasm')

              const bundleBase64 = shouldBePresent(
                vault.chainKeyShares?.[Chain.ZcashSapling],
                'Frozt keyshare bundle'
              )
              const pubKeyPackageBase64 = shouldBePresent(
                vault.chainPublicKeys?.[Chain.ZcashSapling],
                'Frozt public key package'
              )
              const bundleBytes = new Uint8Array(
                Buffer.from(bundleBase64, 'base64')
              )
              const keyPackage = frozt_keyshare_bundle_key_package(bundleBytes)
              const pubKeyPackage = new Uint8Array(
                Buffer.from(pubKeyPackageBase64, 'base64')
              )
              const froztSignWithAlpha = async (
                message: Uint8Array,
                alpha: Uint8Array,
                index: number
              ): Promise<Uint8Array> => {
                return withMpcRetry(async () => {
                  const session = await createFroztSignSessionWithAlpha({
                    serverUrl,
                    sessionId,
                    localPartyId: vault.localPartyId,
                    hexEncryptionKey: encryptionKeyHex,
                    setupMessageId: `frozt-sign-setup-${index}`,
                    isInitiatingDevice,
                    signers,
                    msgToSign: message,
                    keyPackage,
                    pubKeyPackage,
                    alpha,
                  })
                  return runFroztSession({
                    session,
                    messageId: `frozt-sign-${index}`,
                    serverUrl,
                    sessionId,
                    localPartyId: vault.localPartyId,
                    signers,
                    hexEncryptionKey: encryptionKeyHex,
                  })
                }, `frozt-sign-alpha-${index}`)
              }

              return handleUnshield({
                payload,
                vault,
                toAddress: payload.toAddress,
                amount: Number(payload.toAmount),
                froztSignWithAlpha,
                preparedTx:
                  zcashPreparedTxFromContext ?? consumeZcashPreparedTx(),
                serverUrl,
                sessionId,
                hexEncryptionKey: encryptionKeyHex,
                isInitiatingDevice,
                signers,
              })
            }

            if (chain === Chain.Monero) {
              return handleMoneroSpend({
                payload,
                vault,
                serverUrl,
                sessionId,
                hexEncryptionKey: encryptionKeyHex,
                isInitiatingDevice,
                signers,
              })
            }

            if (
              chain === Chain.Zcash &&
              isZcashSaplingAddress(payload.toAddress)
            ) {
              return handleShield({
                payload,
                vault,
                keysignAction,
                walletCore,
              })
            }

            const publicKey = getPublicKey({
              chain,
              walletCore,
              hexChainCode: vault.hexChainCode,
              publicKeys: vault.publicKeys,
              chainPublicKeys: vault.chainPublicKeys,
            })

            const chainKind = getChainKind(chain)
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

            const signatureAlgorithm = signatureAlgorithms[chainKind]

            const coinType = getCoinType({ walletCore, chain })
            const signatures = await keysignAction({
              msgs,
              signatureAlgorithm,
              coinType,
              chain,
              toAddress: payload.toAddress,
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
            if (
              isMoneroBalanceFinalisePayload({
                method,
                message,
              })
            ) {
              return handleMoneroBalanceFinalise({
                message,
                vault,
                serverUrl,
                sessionId,
                hexEncryptionKey: encryptionKeyHex,
                isInitiatingDevice,
                signers,
                invalidateBalances: async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ['coinBalance'],
                  })
                },
              })
            }

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

type UnshieldContext = {
  payload: any
  vault: Vault
  toAddress: string
  amount: number
  froztSignWithAlpha: (
    message: Uint8Array,
    alpha: Uint8Array,
    index: number
  ) => Promise<Uint8Array>
  preparedTx?: ZcashPreparedTx | null
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiatingDevice: boolean
  signers: string[]
}

const buildShieldedTxResult = (
  rawTx: Uint8Array
): { hash: string; data: any } => {
  const txidDigest = getZcashTxidDigest(rawTx)
  const hashHex = Buffer.from(txidDigest).reverse().toString('hex')
  return {
    hash: hashHex,
    data: {
      encoded: rawTx,
      signingResultV2: { encoded: rawTx },
    } as any,
  }
}

const froztSignAll = async (
  sighashHex: string,
  alphaHexes: string[],
  froztSignWithAlpha: UnshieldContext['froztSignWithAlpha']
): Promise<Uint8Array> => {
  const sighash = new Uint8Array(Buffer.from(sighashHex, 'hex'))

  const signatures: Uint8Array[] = []
  for (let i = 0; i < alphaHexes.length; i++) {
    const alpha = new Uint8Array(Buffer.from(alphaHexes[i], 'hex'))
    const sig = await froztSignWithAlpha(sighash, alpha, i)
    signatures.push(sig)
  }

  const totalLen = signatures.reduce((sum, s) => sum + s.length, 0)
  const allSigs = new Uint8Array(totalLen)
  let offset = 0
  for (const sig of signatures) {
    allSigs.set(sig, offset)
    offset += sig.length
  }
  return allSigs
}

const handleUnshield = async ({
  payload,
  vault,
  toAddress,
  amount,
  froztSignWithAlpha,
  preparedTx,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiatingDevice,
  signers,
}: UnshieldContext): Promise<KeysignResult> => {
  if (!isInitiatingDevice) {
    const { sighash: sighashHex, alphas: alphaHexes } =
      await pollForZcashSaplingSetup({
        serverUrl,
        sessionId,
        localPartyId: vault.localPartyId,
        hexEncryptionKey,
      })

    await froztSignAll(sighashHex, alphaHexes, froztSignWithAlpha)
    return { txs: [] }
  }

  let prepared: ZcashPreparedTx

  if (preparedTx) {
    prepared = preparedTx
  } else {
    const senderCoin = getKeysignCoin(payload)
    prepared = await prepareZcashSaplingTx({
      vault,
      zAddress: senderCoin.address,
      toAddress,
      amount,
    })
  }

  const { builder, noteNullifiers, zAddress, publicKeyEcdsa } = prepared
  const { alphas: alphaHexes, sighash: sighashHex } = prepared.signData.context

  const peers = signers.filter(party => party !== vault.localPartyId)
  const setupMessage = new TextEncoder().encode(
    JSON.stringify({ sighash: sighashHex, alphas: alphaHexes })
  )
  const encrypted = toMpcServerMessage(setupMessage, hexEncryptionKey)
  for (const peer of peers) {
    await sendMpcRelayMessage({
      serverUrl,
      sessionId,
      message: {
        session_id: sessionId,
        from: vault.localPartyId,
        to: [peer],
        body: encrypted,
        hash: getMessageHash(base64Encode(setupMessage)),
        sequence_no: 0,
      },
      messageId: 'zcash-sapling-setup',
    })
  }

  const allSigs = await froztSignAll(sighashHex, alphaHexes, froztSignWithAlpha)

  const rawTx = builder.complete(allSigs)
  const txResult = buildShieldedTxResult(rawTx)

  if (!payload.skipBroadcast) {
    const broadcastResponse = await sendTransaction(rawTx)
    console.log('[handleUnshield] broadcast response:', {
      errorCode: broadcastResponse.errorCode,
      errorMessage: broadcastResponse.errorMessage,
    })
    const broadcastFailed = broadcastResponse.errorCode !== 0
    const alreadySpent =
      broadcastResponse.errorMessage?.includes('duplicate nullifier') ?? false

    if (!broadcastFailed || alreadySpent) {
      const storage = getZcashScanStorage()
      const scanData = await storage.load(publicKeyEcdsa)
      if (scanData) {
        for (const nullifier of noteNullifiers) {
          const note = scanData.notes.find(n => n.nullifier === nullifier)
          if (note) note.spent = true
        }
        await storage.save(scanData)
      }

      try {
        const bundleBase64 = shouldBePresent(
          vault.chainKeyShares?.[Chain.ZcashSapling],
          'Frozt keyshare bundle'
        )
        const birthday = Number(
          frozt_keyshare_bundle_birthday(Buffer.from(bundleBase64, 'base64'))
        )

        await ensureZcashScanDataSynced({
          zAddress,
          publicKeyEcdsa,
          pubKeyPackage: Buffer.from(
            shouldBePresent(
              vault.chainPublicKeys?.[Chain.ZcashSapling],
              'Frozt public key package'
            ),
            'base64'
          ),
          saplingExtras: Buffer.from(
            shouldBePresent(vault.saplingExtras, 'Sapling extras'),
            'base64'
          ),
          birthHeight: birthday > 0 ? birthday : null,
        })
      } catch (error) {
        console.warn('[handleUnshield] post-broadcast sync failed:', error)
      }
    }

    if (broadcastFailed) {
      throw new Error(
        `Zcash broadcast failed: ${broadcastResponse.errorMessage} (code ${broadcastResponse.errorCode})`
      )
    }
  }

  return { txs: [txResult] }
}

const shieldingFee = 10000

type ShieldContext = {
  payload: any
  vault: Vault
  keysignAction: KeysignAction
  walletCore: WalletCore
}

const reverseTxid = (hexTxid: string): Uint8Array => {
  const bytes = new Uint8Array(
    hexTxid.match(/.{2}/g)!.map(b => parseInt(b, 16))
  )
  bytes.reverse()
  return bytes
}

const packDerSignatures = (signatures: KeysignSignature[]): Uint8Array => {
  const parts: Uint8Array[] = []
  for (const sig of signatures) {
    const der = new Uint8Array(Buffer.from(sig.der_signature, 'hex'))
    const lenBuf = new Uint8Array(2)
    new DataView(lenBuf.buffer).setUint16(0, der.length, true)
    parts.push(lenBuf, der)
  }
  const total = parts.reduce((sum, p) => sum + p.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const p of parts) {
    result.set(p, offset)
    offset += p.length
  }
  return result
}

const handleShield = async ({
  payload,
  vault,
  keysignAction,
  walletCore,
}: ShieldContext): Promise<KeysignResult> => {
  const senderCoin = getKeysignCoin(payload)
  const senderAddress = senderCoin.address
  const sendAmount = Number(payload.toAmount)

  const utxos = await getShieldingUtxos(senderAddress)
  if (utxos.length === 0) {
    throw new Error('No spendable transparent UTXOs found')
  }

  const totalInput = utxos.reduce((sum, u) => sum + u.value, 0)
  if (totalInput < sendAmount + shieldingFee) {
    throw new Error(
      `Insufficient transparent balance (have: ${totalInput}, need: ${sendAmount + shieldingFee})`
    )
  }

  const saplingExtras = Buffer.from(
    shouldBePresent(vault.saplingExtras, 'Sapling extras'),
    'base64'
  )

  const changeAmount = totalInput - sendAmount - shieldingFee

  const [{ output: outputParams }, latestBlock] = await Promise.all([
    loadSaplingParams(),
    getLatestBlock(),
  ])

  const builder = new WasmShieldingTxBuilder(
    outputParams,
    saplingExtras,
    latestBlock.height
  )

  for (const utxo of utxos) {
    builder.addInput(
      reverseTxid(utxo.txHash),
      utxo.index,
      utxo.value,
      new Uint8Array(Buffer.from(utxo.scriptHex, 'hex'))
    )
  }

  builder.addOutput(payload.toAddress, sendAmount)
  if (changeAmount > 0) {
    builder.addTransparentOutput(senderAddress, changeAmount)
  }
  builder.build()

  const sighashBytes = builder.sighashes
  const numInputs = builder.numInputs
  const sighashHexes: string[] = []
  for (let i = 0; i < numInputs; i++) {
    const chunk = sighashBytes.slice(i * 32, (i + 1) * 32)
    sighashHexes.push(Buffer.from(chunk).toString('hex'))
  }

  const coinType = getCoinType({ walletCore, chain: Chain.Zcash })
  const signatures = await keysignAction({
    msgs: sighashHexes.sort(),
    signatureAlgorithm: 'ecdsa',
    coinType,
    chain: Chain.Zcash,
    toAddress: payload.toAddress,
  })

  const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
    Buffer.from(msg, 'base64').toString('hex')
  )
  const orderedSignatures = sighashHexes.map(hex =>
    shouldBePresent(signaturesRecord[hex], `Signature for sighash ${hex}`)
  )

  const ecdsaSigs = packDerSignatures(orderedSignatures)

  const publicKey = getPublicKey({
    chain: Chain.Zcash,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })
  const compressedPubkey = new Uint8Array(publicKey.data())
  const pubkeys = new Uint8Array(numInputs * 33)
  for (let i = 0; i < numInputs; i++) {
    pubkeys.set(compressedPubkey, i * 33)
  }

  const rawTx = builder.complete(ecdsaSigs, pubkeys)
  const txResult = buildShieldedTxResult(new Uint8Array(rawTx))

  if (!payload.skipBroadcast) {
    const broadcastResponse = await sendTransaction(new Uint8Array(rawTx))
    console.log('[handleShield] broadcast response:', {
      errorCode: broadcastResponse.errorCode,
      errorMessage: broadcastResponse.errorMessage,
    })
    if (broadcastResponse.errorCode !== 0) {
      throw new Error(
        `Zcash shielding broadcast failed: ${broadcastResponse.errorMessage} (code ${broadcastResponse.errorCode})`
      )
    }
  }

  return { txs: [txResult] }
}

type MoneroSpendContext = {
  payload: any
  vault: Vault
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiatingDevice: boolean
  signers: string[]
}

const pollForSignableTx = async ({
  serverUrl,
  sessionId,
  localPartyId,
  hexEncryptionKey,
}: {
  serverUrl: string
  sessionId: string
  localPartyId: string
  hexEncryptionKey: string
}): Promise<{
  signableTx: Uint8Array
  publicKeyEcdsa?: string
  spentOutputKeys?: string[]
}> => {
  const start = Date.now()
  const timeoutMs = 120_000

  while (true) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timeout waiting for Monero signableTx from coordinator')
    }

    const messages = await getMpcRelayMessages({
      serverUrl,
      localPartyId,
      sessionId,
      messageId: 'monero-spend-setup',
    })

    if (messages.length > 0) {
      const decrypted = fromMpcServerMessage(messages[0].body, hexEncryptionKey)
      await deleteMpcRelayMessage({
        serverUrl,
        localPartyId,
        sessionId,
        messageHash: messages[0].hash,
        messageId: 'monero-spend-setup',
      })
      const bytes = new Uint8Array(decrypted)
      try {
        const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
          signableTx?: string
          publicKeyEcdsa?: string
          spentOutputKeys?: string[]
        }
        if (parsed.signableTx) {
          return {
            signableTx: new Uint8Array(
              Buffer.from(parsed.signableTx, 'base64')
            ),
            publicKeyEcdsa: parsed.publicKeyEcdsa,
            spentOutputKeys: parsed.spentOutputKeys,
          }
        }
      } catch {
        // Backward compatibility with older raw signableTx payloads.
      }

      return { signableTx: bytes }
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

const pollForZcashSaplingSetup = async ({
  serverUrl,
  sessionId,
  localPartyId,
  hexEncryptionKey,
}: {
  serverUrl: string
  sessionId: string
  localPartyId: string
  hexEncryptionKey: string
}): Promise<{ sighash: string; alphas: string[] }> => {
  const start = Date.now()
  const timeoutMs = 120_000

  while (true) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        'Timeout waiting for Zcash Sapling setup from coordinator'
      )
    }

    const messages = await getMpcRelayMessages({
      serverUrl,
      localPartyId,
      sessionId,
      messageId: 'zcash-sapling-setup',
    })

    if (messages.length > 0) {
      const decrypted = fromMpcServerMessage(messages[0].body, hexEncryptionKey)
      await deleteMpcRelayMessage({
        serverUrl,
        localPartyId,
        sessionId,
        messageHash: messages[0].hash,
        messageId: 'zcash-sapling-setup',
      })
      const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as {
        sighash: string
        alphas: string[]
      }
      return parsed
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

const handleMoneroSpend = async ({
  payload,
  vault,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiatingDevice,
  signers,
}: MoneroSpendContext): Promise<KeysignResult> => {
  const peers = signers.filter(party => party !== vault.localPartyId)

  const keyShareBase64 = shouldBePresent(
    vault.chainKeyShares?.[Chain.Monero],
    'Monero keyshare'
  )
  const keyShare = new Uint8Array(Buffer.from(keyShareBase64, 'base64'))

  let signableTx: Uint8Array
  let prepared = consumeMoneroPreparedTx()

  if (isInitiatingDevice) {
    if (prepared) {
      signableTx = prepared.signableTx
    } else {
      const senderCoin = getKeysignCoin(payload)
      prepared = await prepareMoneroSpendTx({
        vault,
        senderAddress: senderCoin.address,
        toAddress: payload.toAddress,
        amount: BigInt(payload.toAmount),
      })
      signableTx = prepared.signableTx
    }

    const setupMessage = new TextEncoder().encode(
      JSON.stringify({
        signableTx: Buffer.from(signableTx).toString('base64'),
        publicKeyEcdsa: prepared?.publicKeyEcdsa,
        spentOutputKeys: prepared?.spentOutputKeys ?? [],
      })
    )
    const encrypted = toMpcServerMessage(setupMessage, hexEncryptionKey)
    for (const peer of peers) {
      await sendMpcRelayMessage({
        serverUrl,
        sessionId,
        message: {
          session_id: sessionId,
          from: vault.localPartyId,
          to: [peer],
          body: encrypted,
          hash: getMessageHash(base64Encode(setupMessage)),
          sequence_no: 0,
        },
        messageId: 'monero-spend-setup',
      })
    }
  } else {
    const setup = await pollForSignableTx({
      serverUrl,
      sessionId,
      localPartyId: vault.localPartyId,
      hexEncryptionKey,
    })
    signableTx = setup.signableTx
    if (setup.spentOutputKeys?.length) {
      prepared = {
        signableTx: setup.signableTx,
        publicKeyEcdsa: setup.publicKeyEcdsa ?? vault.publicKeys.ecdsa,
        spentOutputKeys: setup.spentOutputKeys,
      }
    }
  }

  const { rawTx, txHash } = await withMpcRetry(
    () =>
      runFromtSpendCeremony({
        keyShare,
        signableTx,
        signers,
        localPartyId: vault.localPartyId,
        serverUrl,
        sessionId,
        hexEncryptionKey,
        isInitiatingDevice,
      }),
    'fromt-sign'
  )

  if (!payload.skipBroadcast) {
    const rawTxHex = Buffer.from(rawTx).toString('hex')
    console.log('[handleMoneroSpend] broadcasting Monero tx', {
      rawTxSize: rawTx.length,
      rawTxHexLength: rawTxHex.length,
      spentOutputKeys: prepared?.spentOutputKeys ?? [],
    })
    await submitRawTx(rawTxHex)

    if (prepared) {
      await markMoneroOutputsSpent({
        publicKeyEcdsa: prepared.publicKeyEcdsa,
        spentOutputKeys: prepared.spentOutputKeys,
      })
    }

    try {
      await ensureMoneroScanDataSynced({
        keyShareBase64,
        publicKeyEcdsa: prepared?.publicKeyEcdsa ?? vault.publicKeys.ecdsa,
      })
    } catch (error) {
      console.warn('[handleMoneroSpend] post-broadcast sync failed:', error)
    }
  }

  return {
    txs: [
      {
        hash: txHash,
        data: { encoded: rawTx } as any,
      },
    ],
  }
}

type MoneroBalanceFinaliseContext = {
  message: string
  vault: Vault
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiatingDevice: boolean
  signers: string[]
  invalidateBalances: () => Promise<void>
}

const handleMoneroBalanceFinalise = async ({
  message,
  vault,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiatingDevice,
  signers,
  invalidateBalances,
}: MoneroBalanceFinaliseContext): Promise<KeysignResult> => {
  const parsedMessage = parseMoneroBalanceFinaliseMessage(message)
  if (!parsedMessage) {
    throw new Error('Invalid Monero balance finalise payload')
  }

  await initializeFromt()

  const keyShareBase64 = shouldBePresent(
    vault.chainKeyShares?.[Chain.Monero],
    'Monero keyshare'
  )
  const keyShare = new Uint8Array(Buffer.from(keyShareBase64, 'base64'))
  const outputsData = getMoneroBalanceFinaliseOutputsData(parsedMessage)
  const keyImageOutputs = getMoneroOutputsForKeyImage(outputsData)

  const keyImages = await withMpcRetry(async () => {
    const session = await createFromtKeyImageSession({
      serverUrl,
      sessionId,
      localPartyId: vault.localPartyId,
      hexEncryptionKey,
      setupMessageId: 'fromt-keyimage-setup',
      isInitiatingDevice,
      signers,
      keyShare,
      outputs: keyImageOutputs,
    })

    return runFroztSession({
      session,
      messageId: 'fromt-keyimage',
      serverUrl,
      sessionId,
      localPartyId: vault.localPartyId,
      signers,
      hexEncryptionKey,
    })
  }, 'fromt-keyimage')

  if (!isInitiatingDevice) {
    return {
      moneroBalanceFinalise: {
        checkedOutputs: parsedMessage.outputCount,
      },
    }
  }

  const result = await finaliseMoneroOutputsWithKeyImages({
    publicKeyEcdsa: parsedMessage.publicKeyEcdsa,
    outputs: parsedMessage.outputs,
    outputsData,
    keyImages,
  })

  await invalidateBalances()

  return {
    moneroBalanceFinalise: result,
  }
}
