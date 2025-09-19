import { Chain } from '@core/chain/Chain'
import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getSolanaTokenMetadata } from '@core/chain/coin/token/metadata/resolvers/solana'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { simulateSolanaTransaction } from './simulate'
import { AddressTableLookup, ParsedResult } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'
type ParseSolanaTxInput = { walletCore: WalletCore; inputTx: Uint8Array }
export const parseSolanaTx = async ({
  walletCore,
  inputTx,
}: ParseSolanaTxInput): Promise<ParsedResult> => {
  const connection = new Connection(solanaRpcUrl)
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )
  if (!encodedTx) throw new Error('Could not encode transaction')
  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx)

  if (!decodedTx.transaction || !decodedTx.transaction.v0)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const v0 = decodedTx.transaction?.v0
  if (!v0) {
    throw new Error('Invalid Solana transaction: missing v0 transaction data')
  }

  const staticKeys = (v0.accountKeys ?? []).map(k => new PublicKey(k))
  const resolvedKeys = await resolveAddressTableKeys(
    (v0.addressTableLookups as AddressTableLookup[]) ?? [],
    connection
  )
  const keys = mergedKeys(staticKeys, resolvedKeys)

  const simulationParams = await simulateSolanaTransaction({
    conn: connection,
    tx: VersionedTransaction.deserialize(buffer),
    keysIn: keys,
  })
  if (!simulationParams) {
    throw new Error('Could not simulate transaction')
  }
  const { inputs, outputs, authority } = simulationParams
  const primaryIn = shouldBePresent(inputs[0])
  const primaryOut = shouldBePresent(outputs[0])
  const outputCoin =
    primaryOut.mint === NATIVE_MINT.toBase58()
      ? chainFeeCoin[Chain.Solana]
      : {
          chain: Chain.Solana,
          id: primaryOut.mint,
          ...(await getSolanaTokenMetadata({
            chain: Chain.Solana,
            id: primaryOut.mint,
          })),
        }

  return {
    authority,
    inAmount: primaryIn.amount.toString(),
    inputMint: primaryIn.mint,
    kind: 'swap',
    outAmount: primaryOut.amount.toString(),
    outputCoin,
  }
}
