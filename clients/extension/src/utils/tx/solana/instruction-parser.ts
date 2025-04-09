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

  getInstructionNameAndData(
    instructions: PartialInstruction[],
    accountKeys: PublicKey[]
  ) {
    console.log('getting parsed:', instructions, accountKeys)

    for (const instruction of instructions) {
      if (accountKeys[instruction.programId].equals(this.programId)) {
        console.log('is equal:', accountKeys[instruction.programId].toString())
        const programDataArray = Object.values(instruction.programData)
        const programDataBuffer = new Uint8Array(programDataArray as any)
        const ix = this.coder.instruction.decode(
          base58.encode(programDataBuffer),
          'base58'
        )
        if (this.isRouting(ix!.name)) {
          console.log('is Routing')
          console.log('data:', ix?.data)
          console.log('inAmount:', (ix?.data as any).inAmount.toNumber())
          console.log(
            'quotedOutAmount:',
            (ix?.data as any).quotedOutAmount.toNumber()
          )
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
