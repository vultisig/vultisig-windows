import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { simulateSolanaTransaction } from './simulate'
import { AddressTableLookup, ParsedResult } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

export const parseSolanaTx = async (
  walletCore: WalletCore,
  inputTx: Uint8Array
): Promise<ParsedResult | null> => {
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
  if (!v0) return null

  const staticKeys = (v0.accountKeys ?? []).map(k => new PublicKey(k))
  const resolvedKeys = await resolveAddressTableKeys(
    (v0.addressTableLookups as AddressTableLookup[]) ?? [],
    connection
  )
  const keys = mergedKeys(staticKeys, resolvedKeys)

  const simulationParams = await simulateSolanaTransaction(
    connection,
    VersionedTransaction.deserialize(buffer),
    keys
  )
  if (!simulationParams) {
    throw new Error('Could not simulate transaction')
  }
  const { inputs, outputs, authority } = simulationParams
  return {
    authority,
    inAmount: Number(inputs[0].amount),
    inputMint: inputs[0].mint,
    kind: 'swap',
    outAmount: Number(outputs[0].amount),
    outputMint: outputs[0].mint,
  }
}
