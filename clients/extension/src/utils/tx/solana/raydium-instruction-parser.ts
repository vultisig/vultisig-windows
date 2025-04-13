import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

import { AddressTableLookup, resolveAddressTableKeys } from './solanaSwap'
import {
  ParsedInstructionsSolanaSwapParams,
  PartialInstruction,
} from './types/types'

export class RaydiumInstructionParser {
  private programId: PublicKey
  private connection: Connection

  constructor(programId: PublicKey) {
    this.programId = programId
    this.connection = new Connection(chainRpcUrl.Solana)
  }

  async getInstructionParsedData(
    instructions: PartialInstruction[],
    accountKeys: PublicKey[],
    lookups: AddressTableLookup[]
  ): Promise<ParsedInstructionsSolanaSwapParams> {
    try {
      const resolvedLookUps = await resolveAddressTableKeys(lookups)
      accountKeys = [...accountKeys, ...resolvedLookUps]

      for (const instruction of instructions) {
        const programIdKey = accountKeys[instruction.programId]
        if (!programIdKey || !programIdKey.equals(this.programId)) continue

        if (!this.isRouting(instruction.programData)) continue

        const inputMint = await this.getMintFromAccount(
          accountKeys,
          instruction.accounts[5]
        )
        const outputMint = await this.getMintFromAccount(
          accountKeys,
          instruction.accounts[6]
        )

        const buffer = Buffer.from(
          Uint8Array.from(Object.values(instruction.programData))
        )
        if (buffer.length < 17) {
          continue
        }
        const authority = accountKeys[0]?.toString() ?? ''
        const inAmount = Number(buffer.readBigUInt64LE(1))
        const outAmount = Number(buffer.readBigUInt64LE(9))

        return {
          authority,
          inputMint,
          outputMint,
          inAmount,
          outAmount,
        }
      }
    } catch (error) {
      console.error(error)
      return {
        authority: accountKeys[0].toString(),
        inputMint: NATIVE_MINT.toString(),
        outputMint: NATIVE_MINT.toString(),
        inAmount: 0,
        outAmount: 0,
      }
    }
    return {
      authority: accountKeys[0].toString(),
      inputMint: NATIVE_MINT.toString(),
      outputMint: NATIVE_MINT.toString(),
      inAmount: 0,
      outAmount: 0,
    }
  }

  private isRouting(programData: Uint8Array): boolean {
    return programData[0] === 0
  }

  private async getMintFromAccount(
    accountKeys: PublicKey[],
    index: number
  ): Promise<string> {
    const pubkey = accountKeys[index]
    if (!pubkey) return NATIVE_MINT.toString()

    try {
      const accountInfo = await this.connection.getParsedAccountInfo(pubkey)
      if (!accountInfo.value) return NATIVE_MINT.toString()

      const mint = (accountInfo.value.data as any).parsed.info.mint
      return mint ?? NATIVE_MINT.toString()
    } catch (err) {
      console.warn(`Failed to resolve mint for index ${index}:`, err)
      return NATIVE_MINT.toString()
    }
  }
}
