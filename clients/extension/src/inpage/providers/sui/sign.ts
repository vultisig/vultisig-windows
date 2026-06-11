import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { Chain } from '@vultisig/core-chain/Chain'
import { buildSuiSerializedSignature } from '@vultisig/core-chain/chains/sui/sign'
import { deserializeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'

const hexToBytes = (hex: string): Uint8Array => Buffer.from(hex, 'hex')

const serializeSuiSignatureBase64 = ({
  signatureHex,
  publicKey,
}: {
  signatureHex: string
  publicKey: Uint8Array
}): string =>
  Buffer.from(
    buildSuiSerializedSignature({
      signature: hexToBytes(signatureHex),
      publicKey,
    })
  ).toString('base64')

type SignSuiPersonalMessageInput = {
  message: Uint8Array
  publicKey: Uint8Array
}

/**
 * Sign a Sui personal message via the existing custom-message keysign flow.
 * Returns the Sui Wallet Standard wire signature and the original bytes (base64).
 */
export const signSuiPersonalMessage = async ({
  message,
  publicKey,
}: SignSuiPersonalMessageInput): Promise<{
  signature: string
  bytes: string
}> => {
  // Send the raw bytes as `0x…` hex so the popup digest helper
  // (`getCustomMessageHex` Sui case) recovers the exact original bytes via
  // its hex-decode branch. UTF-8 round-tripping would corrupt non-text
  // payloads (binary blobs, certain CJK normalisations, etc.) and produce
  // signatures over altered bytes.
  const messageString = `0x${Buffer.from(message).toString('hex')}`

  const signatureHex = await callPopup({
    signMessage: {
      sign_message: { chain: Chain.Sui, message: messageString },
    },
  })

  return {
    signature: serializeSuiSignatureBase64({
      signatureHex: String(signatureHex),
      publicKey,
    }),
    bytes: Buffer.from(message).toString('base64'),
  }
}

type SignSuiTransactionInput = {
  // Already-built Sui PTB bytes (base64).
  transactionBytesBase64: string
  // Connected Sui address — routes the popup to the vault that owns it.
  account: string
}

/**
 * Sign an already-built Sui transaction block through the standard keysign
 * pipeline (`signSui` keysign payload). The `transactionBytesBase64` must
 * already be the BCS bytes of the built PTB — see `buildSuiTransactionBytes`
 * for the helper that calls into the background to build from a `Transaction`
 * / `{ toJSON }` wrapper.
 *
 * WalletCore signs the bytes via `signDirectMessage` and returns a Sui
 * `SigningOutput` whose `signature` is already the Wallet Standard wire
 * signature (`flag || sig || pubKey`, base64) — no manual assembly needed.
 */
export const signSuiTransaction = async ({
  transactionBytesBase64,
  account,
}: SignSuiTransactionInput): Promise<{
  signature: string
  bytes: string
}> => {
  const [result] = await callPopup(
    {
      sendTx: {
        serialized: {
          data: [transactionBytesBase64],
          // The dApp owns broadcasting: `sui:signTransaction` returns the
          // signature, and `sui:signAndExecuteTransaction*` broadcasts via
          // `executeSuiTransaction`. Never broadcast from the keysign pipeline.
          skipBroadcast: true,
          chain: Chain.Sui,
        },
      },
    },
    { account }
  )

  const { signature } = deserializeSigningOutput(Chain.Sui, result.data)

  return {
    signature,
    bytes: transactionBytesBase64,
  }
}

type HasToJson = { toJSON: () => string | Promise<string> }
type HasSerialize = { serialize: () => string }

const hasToJson = (value: unknown): value is HasToJson =>
  typeof value === 'object' &&
  value !== null &&
  'toJSON' in value &&
  typeof value.toJSON === 'function'

const hasSerialize = (value: unknown): value is HasSerialize =>
  typeof value === 'object' &&
  value !== null &&
  'serialize' in value &&
  typeof value.serialize === 'function'

const isUint8Array = (value: unknown): value is Uint8Array =>
  value instanceof Uint8Array

type BuildSuiTransactionInput = {
  sender: string
  // dApps pass either a built `Uint8Array`, a `Transaction` instance (legacy
  // `sui:signTransactionBlock`), or a `{ toJSON: () => Promise<string> }`
  // wrapper (`sui:signTransaction` v2). We duck-type to stay version-agnostic
  // — the dApp may bundle a different `@mysten/sui` version than the wallet.
  transaction: unknown
}

/**
 * Resolve the dApp-supplied transaction input to a base64-encoded built PTB.
 * If the dApp passed raw bytes we pass them through; otherwise we ship the
 * serialized transaction to the background script and let it build with the
 * SDK's pinned Sui client. Running the build under the dApp page's CSP would
 * be blocked by their `connect-src` allowlist.
 */
export const buildSuiTransactionBytes = async ({
  sender,
  transaction,
}: BuildSuiTransactionInput): Promise<string> => {
  if (isUint8Array(transaction)) {
    return Buffer.from(transaction).toString('base64')
  }

  const transactionJson = hasToJson(transaction)
    ? await transaction.toJSON()
    : hasSerialize(transaction)
      ? transaction.serialize()
      : null

  if (!transactionJson) {
    throw new Error('Unsupported Sui transaction input')
  }

  const { transactionBytes } = await callBackground({
    suiBuildTransaction: { transactionJson, sender },
  })

  return transactionBytes
}

type ExecuteSuiTransactionInput = {
  transactionBytesBase64: string
  signature: string
}

/**
 * Broadcast a signed Sui PTB via the background script's Sui RPC client.
 * Returns whatever `executeTransactionBlock` returns.
 */
export const executeSuiTransaction = async ({
  transactionBytesBase64,
  signature,
}: ExecuteSuiTransactionInput): Promise<unknown> =>
  callBackground({
    suiExecuteTransaction: {
      transactionBytes: transactionBytesBase64,
      signature,
    },
  })
