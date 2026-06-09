import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { buildSuiTransactionFromJson } from '@vultisig/core-chain/chains/sui/buildTransactionFromJson'

/**
 * Builds a Sui PTB from a dApp-supplied serialized Transaction and returns the
 * BCS bytes (base64). Runs in the extension service worker so the underlying
 * RPC call uses the SDK's pinned Sui client and isn't blocked by the dApp
 * page's Content Security Policy — the inpage script forwards
 * `Transaction.toJSON()` here instead of calling `Transaction.build({ client })`
 * directly.
 */
export const suiBuildTransaction: BackgroundResolver<
  'suiBuildTransaction'
> = async ({ input: { transactionJson, sender } }) => {
  const bytes = await buildSuiTransactionFromJson({ transactionJson, sender })
  return { transactionBytes: Buffer.from(bytes).toString('base64') }
}
