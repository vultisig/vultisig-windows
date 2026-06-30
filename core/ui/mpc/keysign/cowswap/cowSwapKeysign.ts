import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { PublicKeys } from '@vultisig/core-chain/publicKey/PublicKeys'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { signatureFormats } from '@vultisig/core-chain/signing/SignatureFormat'
import { submitCowSwapOrder } from '@vultisig/core-chain/swap/general/cowswap/api/submitCowSwapOrder'
import {
  CowSwapKeysignData,
  decodeCowSwapKeysignData,
} from '@vultisig/core-chain/swap/general/cowswap/keysign/cowSwapKeysignData'
import { buildCowSwapOrderTypedData } from '@vultisig/core-chain/swap/general/cowswap/sign/buildCowSwapOrderTypedData'
import {
  decodeSigningOutput,
  deserializeSigningOutput,
} from '@vultisig/core-chain/tw/signingOutput'
import { Tx } from '@vultisig/core-chain/tx'
import { getTxHash } from '@vultisig/core-chain/tx/hash'
import { KeysignResult } from '@vultisig/core-mpc/keysign/KeysignResult'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { buildCowSwapApprovalSigningInput } from '@vultisig/core-mpc/keysign/swap/cowswap/buildCowSwapApprovalSigningInput'
import { compileTx } from '@vultisig/core-mpc/tx/compile/compileTx'
import { getPreSigningHashes } from '@vultisig/core-mpc/tx/preSigningHashes'
import { generateSignature } from '@vultisig/core-mpc/tx/signature/generateSignature'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { recordFromItems } from '@vultisig/lib-utils/record/recordFromItems'
import { Buffer } from 'buffer'
import { TypedDataEncoder } from 'ethers'

import { KeysignAction } from '../action/state/keysignAction'
import { broadcastKeysignTx } from '../broadcastKeysignTx'

/**
 * Recover the CowSwap order carried in a keysign payload, or `null` for any
 * other swap/transaction. CowSwap rides on the `oneinchSwapPayload` arm
 * (provider `'cowswap'`) with the order serialized into `quote.tx.data` — see
 * `buildSwapKeysignPayload` / `cowSwapKeysignData` in the SDK.
 */
export const getCowSwapKeysignData = (
  payload: KeysignPayload
): CowSwapKeysignData | null => {
  if (payload.swapPayload?.case !== 'oneinchSwapPayload') {
    return null
  }
  if (payload.swapPayload.value.provider !== 'cowswap') {
    return null
  }
  const data = payload.swapPayload.value.quote?.tx?.data
  if (!data) {
    return null
  }
  return decodeCowSwapKeysignData(data)
}

/**
 * Pack an MPC signature into the 65-byte `r || s || v` hex the CowSwap orderbook
 * expects for the `eip712` signing scheme. Ethereum `ecrecover` (and the
 * orderbook) expect `v ∈ {27, 28}`. MPC libraries report the recovery id either
 * as `0/1` or already normalized to `27/28`, so bump the low form by 27 and
 * leave an already-normalized value untouched.
 */
const formatCowSwapOrderSignature = (signature: KeysignSignature): string => {
  const { r, s, recovery_id } = signature
  if (!r || !s || recovery_id === undefined) {
    throw new Error('Incomplete signature for CowSwap order')
  }
  const recoveryId = parseInt(recovery_id, 16)
  if (Number.isNaN(recoveryId)) {
    throw new Error(`Invalid recovery_id for CowSwap order: ${recovery_id}`)
  }
  const v = recoveryId < 27 ? recoveryId + 27 : recoveryId
  return `0x${r}${s}${v.toString(16).padStart(2, '0')}`
}

type SignCowSwapOrderInput = {
  payload: KeysignPayload
  cowswapData: CowSwapKeysignData
  chain: Chain
  walletCore: WalletCore
  vault: {
    hexChainCode: string
    publicKeys: PublicKeys
    chainPublicKeys?: Partial<Record<Chain, string>>
  }
  keysignAction: KeysignAction
}

/**
 * Sign and submit a CowSwap RFQ order.
 *
 * Two legs, both ECDSA, signed in a single MPC ceremony:
 *   1/2 (optional) on-chain ERC-20 approval to the GPv2VaultRelayer — only when
 *       the sell token lacks sufficient allowance. Compiled + broadcast normally.
 *   2/2 the off-chain EIP-712 order digest — NOT broadcast; the formatted
 *       signature is POSTed to the orderbook, which returns the order UID.
 *
 * The returned `txs` end with the order leg whose `hash` is the order UID. The
 * tx-history recorder uses that UID as the record's `txHash`; the status poller
 * then polls the orderbook by UID until the order settles (or expires).
 */
export const signCowSwapOrder = async ({
  payload,
  cowswapData,
  chain,
  walletCore,
  vault,
  keysignAction,
}: SignCowSwapOrderInput): Promise<KeysignResult> => {
  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })
  const coinType = getCoinType({ walletCore, chain })
  const signatureAlgorithm = getSignatureAlgorithm(chain)

  // 1/2 — optional on-chain approval to the VaultRelayer.
  const approveTxInputData = buildCowSwapApprovalSigningInput({
    keysignPayload: payload,
    walletCore,
  })
  const approveHash = approveTxInputData
    ? Buffer.from(
        getPreSigningHashes({
          txInputData: approveTxInputData,
          walletCore,
          chain,
          keysignPayload: payload,
        })[0]
      ).toString('hex')
    : undefined

  // 2/2 — off-chain EIP-712 order digest. Hashed exactly as the custom-message
  // `eth_signTypedData_v4` path does (ethers TypedDataEncoder, EIP712Domain
  // omitted since the domain is supplied separately).
  const orderTypedData = buildCowSwapOrderTypedData({
    order: cowswapData.order,
    chainId: cowswapData.chainId,
  })
  const orderHash = stripHexPrefix(
    TypedDataEncoder.hash(
      orderTypedData.domain,
      { Order: [...orderTypedData.types.Order] },
      orderTypedData.message
    )
  )

  // One ceremony for both digests. Sort for deterministic cross-party ordering,
  // matching the standard keysign path.
  const msgs = [...(approveHash ? [approveHash] : []), orderHash].sort()
  const signatures = await keysignAction({
    msgs,
    signatureAlgorithm,
    coinType,
    chain,
  })
  const signaturesRecord = recordFromItems(signatures, ({ msg }) =>
    Buffer.from(msg, 'base64').toString('hex')
  )

  const txs: Tx[] = []

  if (approveTxInputData && approveHash) {
    const compiledTx = compileTx({
      walletCore,
      txInputData: approveTxInputData,
      chain,
      publicKey,
      signatures: signaturesRecord,
      keysignPayload: payload,
    })
    const data = decodeSigningOutput(chain, compiledTx)
    const hash = await getTxHash({ chain, tx: data })

    if (!payload.skipBroadcast) {
      await broadcastKeysignTx({ chain, tx: data })
    }

    txs.push({ data, hash })
  }

  const orderSignature = signaturesRecord[orderHash]
  const signatureHex = formatCowSwapOrderSignature(orderSignature)

  const orderUid = await submitCowSwapOrder({
    apiBase: cowswapData.apiBase,
    order: cowswapData.order,
    signature: signatureHex,
    from: cowswapData.from,
  })

  // The order leg has no chain SigningOutput — carry the raw signature bytes so
  // the `Tx.data` type is satisfied. It is never broadcast or read downstream;
  // the order UID in `hash` is what the recorder/poller consume.
  const orderSignatureBytes = generateSignature({
    walletCore,
    signature: orderSignature,
    signatureFormat: signatureFormats.evm,
  })
  txs.push({
    hash: orderUid,
    data: deserializeSigningOutput(chain, {
      encoded: Buffer.from(orderSignatureBytes).toString('base64'),
    }),
  })

  return { txs }
}
