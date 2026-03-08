import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getShieldingUtxos } from '@core/chain/chains/zcash/getShieldingUtxos'
import { isZcashShieldedAddress } from '@core/chain/chains/zcash/isZcashShieldedAddress'
import {
  getLatestBlock,
  sendTransaction,
} from '@core/chain/chains/zcash/lightwalletd/client'
import {
  getUnspentNotes,
  markNoteSpent,
} from '@core/chain/chains/zcash/SaplingNote'
import { loadSaplingParams } from '@core/chain/chains/zcash/saplingParams'
import { getSaplingProver } from '@core/chain/chains/zcash/saplingProver'
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
import { FroztKeysign } from '@core/mpc/frozt/froztKeysign'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignResult } from '@core/mpc/keysign/KeysignResult'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { Vault } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  KeysignAction,
  useKeysignAction,
} from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useKeysignMutationListener } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import {
  customMessageDefaultChain,
  customMessageSupportedChains,
} from '@core/ui/mpc/keysign/customMessage/chains'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { blake2b } from '@noble/hashes/blake2.js'
import { useMutation } from '@tanstack/react-query'
import { WalletCore } from '@trustwallet/wallet-core'
import { frozt_sapling_derive_keys, WasmShieldingTxBuilder } from 'frozt-wasm'

import { getCustomMessageHex } from '../../customMessage/getCustomMessageHex'

export const useKeysignMutation = (payload: KeysignMessagePayload) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  const keysignAction = useKeysignAction()
  const mutationListener = useKeysignMutationListener()

  const isInitiatingDevice = useIsInitiatingDevice()
  const serverUrl = useMpcServerUrl()
  const sessionId = useMpcSessionId()
  const encryptionKeyHex = useCurrentHexEncryptionKey()
  const peers = useMpcPeers()

  return useMutation({
    mutationFn: async (): Promise<KeysignResult> => {
      return matchRecordUnion<KeysignMessagePayload, Promise<KeysignResult>>(
        payload,
        {
          keysign: async payload => {
            const chain = getKeysignChain(payload)

            if (chain === Chain.ZcashShielded) {
              const froztSignWithAlpha = async (
                message: Uint8Array,
                alpha: Uint8Array
              ): Promise<Uint8Array> => {
                const keyPackage = shouldBePresent(
                  vault.chainKeyShares?.[Chain.ZcashShielded],
                  'Frozt keyshare'
                )
                const pubKeyPackage = shouldBePresent(
                  vault.chainPublicKeys?.[Chain.ZcashShielded],
                  'Frozt public key package'
                )
                const froztKeysign = new FroztKeysign(
                  isInitiatingDevice,
                  serverUrl,
                  sessionId,
                  vault.localPartyId,
                  [vault.localPartyId, ...peers],
                  encryptionKeyHex
                )
                return froztKeysign.signWithAlpha(
                  message,
                  keyPackage,
                  pubKeyPackage,
                  alpha
                )
              }

              return handleUnshield({
                payload,
                vault,
                toAddress: payload.toAddress,
                amount: Number(payload.toAmount),
                fee: 10000,
                froztSignWithAlpha,
              })
            }

            if (
              chain === Chain.Zcash &&
              isZcashShieldedAddress(payload.toAddress)
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
  fee: number
  froztSignWithAlpha: (
    message: Uint8Array,
    alpha: Uint8Array
  ) => Promise<Uint8Array>
}

const zcashTxHashPersonalization = (() => {
  const p = new Uint8Array(16)
  new TextEncoder().encode('ZcashTxHa').forEach((b, i) => (p[i] = b))
  return p
})()

const buildShieldedTxResult = (
  rawTx: Uint8Array
): { hash: string; data: any } => {
  const txHash = blake2b(rawTx, {
    personalization: zcashTxHashPersonalization,
    dkLen: 32,
  })
  const hashHex = Buffer.from(txHash).reverse().toString('hex')
  return {
    hash: hashHex,
    data: {
      encoded: rawTx,
      signingResultV2: { encoded: rawTx },
    } as any,
  }
}

const handleUnshield = async ({
  payload,
  vault,
  toAddress,
  amount,
  fee,
  froztSignWithAlpha,
}: UnshieldContext): Promise<KeysignResult> => {
  const senderCoin = getKeysignCoin(payload)
  const zAddress = senderCoin.address

  const unspentNotes = getUnspentNotes(zAddress)
  const note = unspentNotes.find(n => n.value >= amount)
  if (!note) {
    throw new Error(
      `No unspent shielded note with sufficient balance (need ${amount} zatoshis)`
    )
  }

  if (!note.noteData || !note.witnessData) {
    throw new Error(
      'Note is missing noteData or witnessData. Block scanning is required to populate these fields.'
    )
  }

  const pubKeyPackageBase64 = shouldBePresent(
    vault.chainPublicKeys?.[Chain.ZcashShielded],
    'Frozt public key package'
  )
  const saplingExtrasBase64 = shouldBePresent(
    vault.saplingExtras,
    'Sapling extras'
  )

  const pubKeyPackage = Buffer.from(pubKeyPackageBase64, 'base64')
  const saplingExtras = Buffer.from(saplingExtrasBase64, 'base64')

  const saplingKeys = frozt_sapling_derive_keys(pubKeyPackage, saplingExtras)

  const noteData = new Uint8Array(Buffer.from(note.noteData, 'hex'))
  const witnessData = new Uint8Array(Buffer.from(note.witnessData, 'hex'))

  const changeAmount = note.value - amount - fee

  const prover = await getSaplingProver()
  const builder = prover.createBuilder(pubKeyPackage, saplingExtras, 0)

  const spendAlpha = builder.addSpend(noteData, witnessData)
  builder.addOutput(toAddress, amount)
  if (changeAmount > 0) {
    builder.addOutput(saplingKeys.address, changeAmount)
  }
  builder.build()

  const sighash = builder.sighash
  const alpha = spendAlpha

  const signature = await froztSignWithAlpha(sighash, alpha)

  const rawTx = builder.complete(signature)
  const txResult = buildShieldedTxResult(rawTx)

  if (!payload.skipBroadcast) {
    await sendTransaction(rawTx)
    markNoteSpent(zAddress, note.nullifier)
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
    await sendTransaction(new Uint8Array(rawTx))
  }

  return { txs: [txResult] }
}
