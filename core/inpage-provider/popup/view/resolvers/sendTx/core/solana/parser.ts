import { Chain } from '@core/chain/Chain'
import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { parseProgramCall } from './parseProgramCall'
import { simulateSolanaTransaction } from './simulate'
import { AddressTableLookup, SolanaTxData } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

type ParseSolanaTxInput = {
  walletCore: WalletCore
  data: string
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  swapProvider: string
}

export const parseSolanaTx = async ({
  walletCore,
  data,
  getCoin,
  swapProvider,
}: ParseSolanaTxInput): Promise<SolanaTxData> => {
  const connection = new Connection(solanaRpcUrl)
  const inputTx = Uint8Array.from(Buffer.from(data, 'base64'))
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )
  if (!encodedTx) throw new Error('Could not encode transaction')
  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx)

  if (!decodedTx.transaction)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const tx = decodedTx.transaction?.v0 ?? decodedTx.transaction?.legacy
  if (!tx)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const staticKeys = (tx.accountKeys ?? []).map(k => new PublicKey(k))

  const resolvedKeys = await resolveAddressTableKeys(
    ('addressTableLookups' in tx
      ? tx.addressTableLookups
      : []) as AddressTableLookup[],
    connection
  )
  const keys = mergedKeys(staticKeys, resolvedKeys)

  const { data: parsedTx, error } = await attempt(
    parseProgramCall({
      tx,
      keys,
      getCoin,
      swapProvider,
      data,
    })
  )
  if (!error && parsedTx) {
    return parsedTx
  }
  const { data: sim, error: simError } = await attempt(
    simulateSolanaTransaction({
      conn: connection,
      tx: VersionedTransaction.deserialize(buffer),
      keysIn: keys,
    })
  )
  if (simError || !sim) {
    throw new Error('Error simulating transaction')
  }
  const { inputs, outputs, authority } = sim
  const primaryIn = shouldBePresent(inputs[0])
  const primaryOut = shouldBePresent(outputs[0])
  const [inputCoin, outputCoin] = await Promise.all(
    [primaryIn, primaryOut].map(({ mint }) => {
      const id = mint === NATIVE_MINT.toBase58() ? undefined : mint

      return getCoin({ chain: Chain.Solana, id })
    })
  )
  return {
    swap: {
      authority,
      inAmount: primaryIn.amount.toString(),
      inputCoin,
      outAmount: primaryOut.amount.toString(),
      outputCoin,
      data,
      swapProvider,
    },
  }
}
