import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { match } from '@lib/utils/match'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import {
  jupiterOrderEngine,
  jupiterV6ProgramId,
  raydiumAmmRouting,
} from './config'
import { handleJupiterOrderEngine } from './handlers/jupiterOrderEngine'
import { handleJupiter } from './handlers/jupiterV6'
import { handleRaydium } from './handlers/raydium'
import { handleSplTransfer } from './handlers/splToken'
import { handleSystemTransfer } from './handlers/systemTransfer'
import {
  AddressTableLookup,
  ParsedResult,
  ParserCtx,
  PartialInstruction,
} from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

export const parseSolanaTx = async (
  walletCore: WalletCore,
  inputTx: Uint8Array
): Promise<ParsedResult | null> => {
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )
  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx!)
  if (!decodedTx.transaction || !decodedTx.transaction.v0)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const v0 = decodedTx.transaction?.v0
  if (!v0) return null

  const staticKeys = (v0.accountKeys ?? []).map(k => new PublicKey(k))
  const connection = new Connection(solanaRpcUrl)
  const resolvedKeys = await resolveAddressTableKeys(
    (v0.addressTableLookups as AddressTableLookup[]) ?? [],
    connection
  )
  const keys = mergedKeys(staticKeys, resolvedKeys)
  const ctx: ParserCtx = {
    connection,
    caches: { accountInfo: new Map() },
  }

  for (const ix of v0.instructions as PartialInstruction[]) {
    const programB58 = keys[ix.programId]?.toBase58()
    if (!programB58) continue

    const handlers: Record<string, () => Promise<ParsedResult | null>> = {
      [jupiterV6ProgramId.toBase58()]: () => handleJupiter(ix, keys, ctx),
      [raydiumAmmRouting.toBase58()]: () => handleRaydium(ix, keys, ctx),
      [jupiterOrderEngine.toBase58()]: () => handleJupiterOrderEngine(ix, keys),
      [TOKEN_PROGRAM_ID.toBase58()]: () => handleSplTransfer(ix, keys, ctx),
      [SystemProgram.programId.toBase58()]: () =>
        handleSystemTransfer(ix, keys),
    }

    if (!(programB58 in handlers)) continue

    const result = await match(programB58 as keyof typeof handlers, handlers)
    if (result) return result
  }

  return null
}
