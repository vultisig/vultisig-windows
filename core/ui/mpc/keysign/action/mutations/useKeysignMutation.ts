import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { buildShieldTx } from '@core/chain/chains/zcash/buildShieldTx'
import { isZcashShieldedAddress } from '@core/chain/chains/zcash/isZcashShieldedAddress'
import { sendTransaction } from '@core/chain/chains/zcash/lightwalletd/client'
import { blake2bHash } from '@core/chain/chains/zcash/saplingCrypto'
import {
  addSaplingNote,
  getUnspentNotes,
  markNoteSpent,
} from '@core/chain/chains/zcash/SaplingNote'
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
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { Vault } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
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
import { frozt_sapling_derive_keys } from '@lib/frozt/frozt_wasm'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { chainPromises } from '@lib/utils/promise/chainPromises'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { useMutation } from '@tanstack/react-query'

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
                  vault.chainKeyShares?.[Chain.Zcash],
                  'Frozt keyshare'
                )
                const pubKeyPackage = shouldBePresent(
                  vault.chainPublicKeys?.[Chain.Zcash],
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
                keysignAction,
                coinType: getCoinType({ walletCore, chain }),
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
                coinType: getCoinType({ walletCore, chain }),
                toAddress: payload.toAddress,
                amount: Number(payload.toAmount),
                fee: 10000,
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

type ShieldedTxContext = {
  payload: any
  vault: Vault
  keysignAction: any
  coinType: any
  toAddress: string
  amount: number
  fee: number
  froztSignWithAlpha?: (
    message: Uint8Array,
    alpha: Uint8Array
  ) => Promise<Uint8Array>
}

const buildShieldedTxResult = (rawTx: Buffer): { hash: string; data: any } => {
  const txHash = blake2bHash(rawTx, 'ZcashTxHa')
  const hashHex = Buffer.from(txHash).reverse().toString('hex')
  return {
    hash: hashHex,
    data: {
      encoded: rawTx,
      signingResultV2: { encoded: rawTx },
    } as any,
  }
}

const handleShield = async ({
  payload,
  keysignAction,
  coinType,
  toAddress,
  amount,
  fee,
}: ShieldedTxContext): Promise<KeysignResult> => {
  const utxoInputs = (payload.utxoInfo ?? []).map((utxo: any) => ({
    txid: utxo.hash,
    vout: Number(utxo.index),
    scriptPubKey: '',
    value: Number(utxo.amount),
  }))

  const shieldResult = buildShieldTx({
    transparentInputs: utxoInputs,
    zAddress: toAddress,
    amount,
    fee,
  })

  const sighash = blake2bHash(shieldResult.rawTx, 'ZcashSigH')
  const hexHash = Buffer.from(sighash).toString('hex')

  await keysignAction({
    msgs: [hexHash],
    signatureAlgorithm: 'ecdsa' as const,
    coinType,
    chain: Chain.Zcash,
    toAddress,
  })

  const txResult = buildShieldedTxResult(shieldResult.rawTx)

  if (!payload.skipBroadcast) {
    await sendTransaction(shieldResult.rawTx)

    const note = {
      ...shieldResult.saplingNote,
      txid: txResult.hash,
    }
    addSaplingNote(toAddress, note)
  }

  return { txs: [txResult] }
}

const handleUnshield = async ({
  payload,
  vault,
  toAddress,
  amount,
  fee,
  froztSignWithAlpha,
}: ShieldedTxContext): Promise<KeysignResult> => {
  if (!froztSignWithAlpha) {
    throw new Error('froztSignWithAlpha is required for unshield')
  }

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
    vault.chainPublicKeys?.[Chain.Zcash],
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
  const txResult = buildShieldedTxResult(Buffer.from(rawTx))

  if (!payload.skipBroadcast) {
    await sendTransaction(rawTx)
    markNoteSpent(zAddress, note.nullifier)
  }

  return { txs: [txResult] }
}
