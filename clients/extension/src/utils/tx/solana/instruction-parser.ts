import { PublicKey } from '@solana/web3.js'
import { BorshCoder } from '@coral-xyz/anchor'
import { IDL } from './idl/jupiter'
import { PartialInstruction } from './types/types'
import base58 from 'bs58'
export class InstructionParser {
  private coder: BorshCoder
  private programId: PublicKey

  constructor(programId: PublicKey) {
    this.programId = programId
    this.coder = new BorshCoder(IDL)
  }

  getInstructionNameAndTransferAuthorityAndLastAccount(
    instructions: PartialInstruction[]
  ) {
    for (const instruction of instructions) {
      if (instruction.programId === this.programId) {
        const ix = this.coder.instruction.decode(
          base58.encode(instruction.programData),
          'base58'
        )
        if (this.isRouting(ix!.name)) {
          console.log('is Routing')
          console.log('data:', ix?.data)
        }
      }
    }
  }

  isRouting(name: string) {
    return (
      name === 'route' ||
      name === 'routeWithTokenLedger' ||
      name === 'sharedAccountsRoute' ||
      name === 'sharedAccountsRouteWithTokenLedger' ||
      name === 'sharedAccountsExactOutRoute' ||
      name === 'exactOutRoute'
    )
  }
}
