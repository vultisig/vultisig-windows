import { Chain } from '@core/chain/Chain'
import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { simulateSolanaTransaction } from './simulate'
import { AddressTableLookup, SolanaSwapTxData } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

type ParseSolanaTxInput = {
  walletCore: WalletCore
  inputTx: Uint8Array
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}

export const parseSolanaTx = async ({
  walletCore,
  inputTx,
  getCoin,
}: ParseSolanaTxInput): Promise<SolanaSwapTxData> => {
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
  const [inputCoin, outputCoin] = await Promise.all(
    [primaryIn, primaryOut].map(({ mint }) => {
      const id = mint === NATIVE_MINT.toBase58() ? undefined : mint

      return getCoin({ chain: Chain.Solana, id })
    })
  )

  return {
    authority,
    inAmount: primaryIn.amount.toString(),
    inputCoin,
    outAmount: primaryOut.amount.toString(),
    outputCoin,
  }
}
