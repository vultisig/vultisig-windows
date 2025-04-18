import { BorshCoder } from '@coral-xyz/anchor'
import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import base58 from 'bs58'

import { IDL } from './idl/jupiter'
import { AddressTableLookup, resolveAddressTableKeys } from './solanaSwap'
import {
  ParsedInstructionsSolanaSwapParams,
  PartialInstruction,
} from './types/types'

export class JupiterInstructionParser {
  private coder: BorshCoder
  private programId: PublicKey

  constructor(programId: PublicKey) {
    this.programId = programId
    this.coder = new BorshCoder(IDL)
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

        const programDataBuffer = new Uint8Array(
          Object.values(instruction.programData) as any
        )
        const ix = this.coder.instruction.decode(
          base58.encode(programDataBuffer),
          'base58'
        )

        if (!ix || !this.isRouting(ix.name)) continue

        const currentIns = IDL.instructions.find(ins => ins.name === ix.name)
        if (!currentIns) continue

        const inAmount = (ix.data as any).inAmount.toNumber()
        const outAmount = (ix.data as any).quotedOutAmount.toNumber()

        const authority = this.getAccountFromIndex(
          currentIns,
          instruction,
          accountKeys,
          'userTransferAuthority'
        )
        const outputMint = this.getAccountFromIndex(
          currentIns,
          instruction,
          accountKeys,
          'destinationMint'
        )

        const inputMint = await this.resolveInputMint(
          currentIns,
          instruction,
          accountKeys,
          authority
        )

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

  private getAccountFromIndex(
    currentIns: any,
    instruction: PartialInstruction,
    accountKeys: PublicKey[],
    accountName: string
  ): string {
    const idx = currentIns.accounts.findIndex(
      (acc: { name: string }) => acc.name === accountName
    )
    if (idx === -1) return ''
    const accIndex = instruction.accounts[idx]
    return accountKeys[accIndex]?.toString() ?? ''
  }

  private async resolveInputMint(
    currentIns: any,
    instruction: PartialInstruction,
    accountKeys: PublicKey[],
    authority: string
  ): Promise<string> {
    const sourceIdx = currentIns.accounts.findIndex((acc: { name: string }) =>
      ['sourceMint', 'userSourceTokenAccount', 'sourceTokenAccount'].includes(
        acc.name
      )
    )
    if (sourceIdx === -1) return NATIVE_MINT.toString()

    const pubkey = accountKeys[instruction.accounts[sourceIdx]]
    if (!pubkey) return NATIVE_MINT.toString()

    if (pubkey.toString() === authority) {
      return NATIVE_MINT.toString()
    }

    const connection = new Connection(chainRpcUrl.Solana)
    const inputAccountInfo = await connection.getParsedAccountInfo(pubkey)

    if (!inputAccountInfo.value) return NATIVE_MINT.toString()

    try {
      return (inputAccountInfo.value.data as any).parsed.info.mint
    } catch (err) {
      console.warn('Error parsing account info for mint:', err)
      return NATIVE_MINT.toString()
    }
  }

  private isRouting(name: string): boolean {
    return [
      'route',
      'routeWithTokenLedger',
      'sharedAccountsRoute',
      'sharedAccountsRouteWithTokenLedger',
      'sharedAccountsExactOutRoute',
      'exactOutRoute',
    ].includes(name)
  }
}
