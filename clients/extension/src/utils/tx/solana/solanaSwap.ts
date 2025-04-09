import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { InstructionParser } from './instruction-parser'
import { JUPITER_V6_PROGRAM_ID } from './constants'
import { PartialInstruction } from './types/types'
import { NATIVE_MINT } from '@solana/spl-token'
import api from '../../api'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
export interface ParsedSolanaSwapParams {
  authority: string | undefined
  inputToken: SolanaJupiterToken
  outputToken: SolanaJupiterToken
  inAmount: number
  outAmount: number
}
export interface AddressTableLookup {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}

export async function getParsedSolanaSwap(
  walletCore: WalletCore,
  inputTx: Uint8Array
) {
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)

  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore?.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )

  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx!)
  console.log('Decoded Output:', decodedTx)
  const tx = decodedTx.transaction!.v0!

  console.log('account Key', tx.accountKeys)
  let staticAccountsPubkey = tx.accountKeys?.map(key => new PublicKey(key))

  const parser = new InstructionParser(JUPITER_V6_PROGRAM_ID)
  const { authority, inputMint, outputMint, inAmount, outAmount } =
    await parser.getInstructionParsedData(
      tx.instructions as PartialInstruction[],
      staticAccountsPubkey!,
      tx.addressTableLookups! as AddressTableLookup[]
    )
  console.log({ authority, inputMint, outputMint, inAmount, outAmount })

  const inputToken = await api.solana.fetchSolanaTokenInfo(inputMint)
  const outputToken = await api.solana.fetchSolanaTokenInfo(outputMint!)

  return { authority, inputToken, outputToken, inAmount, outAmount }
}

export async function resolveAddressTableKeys(
  lookups: AddressTableLookup[]
): Promise<PublicKey[]> {
  const allResolvedKeys: PublicKey[] = []
  const connection = new Connection(chainRpcUrl.Solana)
  for (const [index, lookup] of lookups.entries()) {
    const tableAccountResult = await connection.getAddressLookupTable(
      new PublicKey(lookup.accountKey)
    )

    if (!tableAccountResult.value) continue

    const table = tableAccountResult.value
    const resolved = [
      ...lookup.writableIndexes.map(idx => table.state.addresses[idx]),
      ...lookup.readonlyIndexes.map(idx => table.state.addresses[idx]),
    ]
    console.log(
      'resolved:',
      'index:',
      index,
      resolved.map(res => res.toString())
    )

    allResolvedKeys.push(...resolved)
  }
  console.log(
    'allResolvedKeys:',
    allResolvedKeys.map(key => key.toString())
  )

  return allResolvedKeys
}
