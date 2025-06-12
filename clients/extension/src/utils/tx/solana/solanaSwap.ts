import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import api from '../../api'
import { jupiterV6ProgramId, raydiumAmmRouting } from './config'
import { JupiterInstructionParser } from './jupiter-instruction-parser'
import { RaydiumInstructionParser } from './raydium-instruction-parser'
import { ParsedSolanaSwapParams, PartialInstruction } from './types/types'

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
export async function getParsedSolanaSwap(
  walletCore: WalletCore,
  inputTx: Uint8Array
): Promise<ParsedSolanaSwapParams> {
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)

  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore?.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )

  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx!)

  if (!decodedTx.transaction || !decodedTx.transaction.v0) {
    throw new Error('Invalid Solana transaction: missing v0 transaction data')
  }

  const tx = decodedTx.transaction.v0
  const staticAccountsPubkey = tx.accountKeys!.map(key => new PublicKey(key))

  const buildToken = async (mint: string): Promise<SolanaJupiterToken> => {
    if (mint === NATIVE_MINT.toString()) {
      return {
        address: mint,
        name: 'Solana',
        symbol: chainFeeCoin.Solana.ticker,
        decimals: chainFeeCoin.Solana.decimals,
        logoURI: chainFeeCoin.Solana.logo,
      }
    }

    try {
      return await api.solana.fetchSolanaTokenInfo(mint)
    } catch (err) {
      console.warn(
        `Failed to fetch token info for ${mint}. Falling back to native SOL:`,
        err
      )
      return {
        address: mint,
        name: 'Solana',
        symbol: chainFeeCoin.Solana.ticker,
        decimals: chainFeeCoin.Solana.decimals,
        logoURI: chainFeeCoin.Solana.logo,
      }
    }
  }

  if (staticAccountsPubkey.some(key => key.equals(jupiterV6ProgramId))) {
    const parser = new JupiterInstructionParser(jupiterV6ProgramId)
    const { authority, inputMint, outputMint, inAmount, outAmount } =
      await parser.getInstructionParsedData(
        tx.instructions as PartialInstruction[],
        staticAccountsPubkey,
        tx.addressTableLookups! as AddressTableLookup[]
      )

    const inputToken = await buildToken(inputMint)
    const outputToken = await buildToken(outputMint)

    return { authority, inputToken, outputToken, inAmount, outAmount }
  }

  if (staticAccountsPubkey.some(key => key.equals(raydiumAmmRouting))) {
    const parser = new RaydiumInstructionParser(raydiumAmmRouting)
    const { authority, inputMint, outputMint, inAmount, outAmount } =
      await parser.getInstructionParsedData(
        tx.instructions as PartialInstruction[],
        staticAccountsPubkey,
        tx.addressTableLookups! as AddressTableLookup[]
      )

    const inputToken = await buildToken(inputMint)
    const outputToken = await buildToken(outputMint)

    return { authority, inputToken, outputToken, inAmount, outAmount }
  }

  // Default fallback if neither Jupiter nor Raydium
  const fallbackToken: SolanaJupiterToken = {
    address: NATIVE_MINT.toString(),
    name: 'Solana',
    symbol: chainFeeCoin.Solana.ticker,
    decimals: chainFeeCoin.Solana.decimals,
    logoURI: chainFeeCoin.Solana.logo,
  }

  return {
    authority:
      staticAccountsPubkey.length > 0 ? staticAccountsPubkey[0].toString() : '',
    inputToken: fallbackToken,
    outputToken: fallbackToken,
    inAmount: 0,
    outAmount: 0,
  }
}

export async function resolveAddressTableKeys(
  lookups: AddressTableLookup[]
): Promise<PublicKey[]> {
  const allResolvedKeys: PublicKey[] = []
  const connection = new Connection(solanaRpcUrl)
  for (const lookup of lookups) {
    const tableAccountResult = await connection.getAddressLookupTable(
      new PublicKey(lookup.accountKey)
    )

    if (!tableAccountResult.value) continue

    const table = tableAccountResult.value
    const resolved = [
      ...lookup.writableIndexes.map(idx => table.state.addresses[idx]),
      ...lookup.readonlyIndexes.map(idx => table.state.addresses[idx]),
    ]
    allResolvedKeys.push(...resolved)
  }

  return allResolvedKeys
}
