import { OtherChain } from '@core/chain/Chain'
import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { getSolanaTokenMetadata } from '@core/chain/coin/token/metadata/resolvers/solana'
import { getAccount, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { jupiterV6ProgramId, raydiumAmmRouting } from './config'
import { JupiterInstructionParser } from './jupiter-instruction-parser'
import { RaydiumInstructionParser } from './raydium-instruction-parser'
import {
  ParsedSolanaTransactionParams,
  PartialInstruction,
} from './types/types'

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}

const nativeSolToken = (): SolanaJupiterToken => ({
  address: NATIVE_MINT.toString(),
  name: 'Solana',
  symbol: chainFeeCoin.Solana.ticker,
  decimals: chainFeeCoin.Solana.decimals,
  logoURI: chainFeeCoin.Solana.logo,
})

//  Read an unsigned 32-bit little-endian integer from a Buffer.
const leU32 = (buf: Buffer, o = 0) => buf.readUInt32LE(o)
//  Read an unsigned 64-bit little-endian integer from a Buffer.
const leU64 = (buf: Buffer, o = 0) => Number(buf.readBigUInt64LE(o))

export async function resolveAddressTableKeys(
  lookups: AddressTableLookup[]
): Promise<PublicKey[]> {
  const allResolvedKeys: PublicKey[] = []
  const connection = new Connection(solanaRpcUrl)

  for (const lookup of lookups) {
    const res = await connection.getAddressLookupTable(
      new PublicKey(lookup.accountKey)
    )
    if (!res.value) continue
    const table = res.value.state.addresses
    // v0 ordering: for each lookup, first all writable, then all readonly
    allResolvedKeys.push(
      ...lookup.writableIndexes.map(idx => table[idx]),
      ...lookup.readonlyIndexes.map(idx => table[idx])
    )
  }
  return allResolvedKeys
}

export async function getParsedSolanaTransaction(
  walletCore: WalletCore,
  inputTx: Uint8Array
): Promise<ParsedSolanaTransactionParams> {
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

  const tx = decodedTx.transaction.v0
  const staticKeys = (tx.accountKeys ?? []).map(k => new PublicKey(k))
  const loadedKeys =
    tx.addressTableLookups && tx.addressTableLookups.length
      ? await resolveAddressTableKeys(
          tx.addressTableLookups as AddressTableLookup[]
        )
      : []
  // Complete keyspace for v0: static first, then loaded
  const allKeys = [...staticKeys, ...loadedKeys]
  const allKeyStr = allKeys.map(k => k.toBase58())

  const buildToken = async (mint: string): Promise<SolanaJupiterToken> => {
    if (mint === NATIVE_MINT.toString()) return nativeSolToken()
    try {
      const key = {
        id: mint,
        chain: OtherChain.Solana,
      } as const
      const coin = await getSolanaTokenMetadata(key)
      return {
        address: mint,
        name: coin.ticker,
        symbol: coin.ticker,
        decimals: coin.decimals,
        logoURI: coin.logo,
      }
    } catch {
      return nativeSolToken()
    }
  }

  // 1) Jupiter swap
  if (allKeys.some(k => k.equals(jupiterV6ProgramId))) {
    const parser = new JupiterInstructionParser(jupiterV6ProgramId)
    const { authority, inputMint, outputMint, inAmount, outAmount } =
      await parser.getInstructionParsedData(
        tx.instructions as PartialInstruction[],
        staticKeys,
        tx.addressTableLookups as AddressTableLookup[]
      )
    return {
      authority,
      inputToken: await buildToken(inputMint),
      outputToken: await buildToken(outputMint),
      inAmount,
      outAmount,
    }
  }

  // 2) Raydium swap
  if (allKeys.some(k => k.equals(raydiumAmmRouting))) {
    const parser = new RaydiumInstructionParser(raydiumAmmRouting)
    const { authority, inputMint, outputMint, inAmount, outAmount } =
      await parser.getInstructionParsedData(
        tx.instructions as PartialInstruction[],
        staticKeys,
        tx.addressTableLookups as AddressTableLookup[]
      )
    return {
      authority,
      inputToken: await buildToken(inputMint),
      outputToken: await buildToken(outputMint),
      inAmount,
      outAmount,
    }
  }

  // 3) SPL Token transfer (Token Program)
  if (allKeyStr.includes(TOKEN_PROGRAM_ID.toBase58())) {
    for (const ix of tx.instructions as PartialInstruction[]) {
      const programIdKey = allKeyStr[ix.programId]
      if (programIdKey !== TOKEN_PROGRAM_ID.toBase58()) continue

      // Common SPL Transfer layout: u8 opcode=12; next 8 bytes = amount (LE)
      const raw = Buffer.from(ix.programData)
      const isTransfer = raw[0] === 12 && raw.length >= 9
      const mintIndex = ix.accounts[1]
      const authorityIndex = ix.accounts[3]
      const receiverATAIndex = ix.accounts[2]

      const inputMint = allKeyStr[mintIndex]
      const receiverATA = allKeyStr[receiverATAIndex]
      const tokenAccountInfo = await getAccount(
        new Connection(solanaRpcUrl),
        new PublicKey(receiverATA)
      )
      const receiverAuthority = tokenAccountInfo.owner.toBase58()

      const inAmount = isTransfer ? leU64(raw, 1) : 0
      return {
        authority: allKeyStr[authorityIndex],
        inputToken: await buildToken(inputMint),
        inAmount,
        receiverAddress: receiverAuthority,
      }
    }
  }

  // 4) Native SOL transfer (System Program)
  if (allKeyStr.includes(SystemProgram.programId.toBase58())) {
    for (const ix of tx.instructions as PartialInstruction[]) {
      const programIdKey = allKeyStr[ix.programId]
      if (programIdKey !== SystemProgram.programId.toBase58()) continue

      const data = Buffer.from(ix.programData)
      const opcode = leU32(data, 0)

      // SystemInstruction::Transfer (2) or TransferWithSeed (12)
      if (opcode === 2 || opcode === 12) {
        const lamports = leU64(data, 4)

        // Accounts:
        // - Transfer: [fromIndex, toIndex]
        // - TransferWithSeed: [fromDerivedIndex, baseIndex, toIndex, baseOwnerIndex]
        const fromIndex = ix.accounts[0]
        const toIndex = opcode === 2 ? ix.accounts[1] : ix.accounts[2]

        const from = allKeyStr[fromIndex]
        const to = allKeyStr[toIndex]

        return {
          authority: from,
          inputToken: nativeSolToken(),
          inAmount: lamports,
          receiverAddress: to,
        }
      }
    }
  }

  // 5) Fallback (unknown program) — treat as SOL with zero amount
  return {
    authority: allKeyStr[0] ?? '',
    inputToken: nativeSolToken(),
    outputToken: nativeSolToken(),
    inAmount: 0,
    outAmount: 0,
  }
}
