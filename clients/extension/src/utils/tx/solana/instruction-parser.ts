import { Connection, PublicKey } from '@solana/web3.js'
import { BorshCoder } from '@coral-xyz/anchor'
import { IDL } from './idl/jupiter'
import { PartialInstruction, RoutePlan } from './types/types'
import base58 from 'bs58'
import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT } from '@solana/spl-token'
import { AddressTableLookup, resolveAddressTableKeys } from './solanaSwap'
export class InstructionParser {
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
  ) {
    const resolvedLookUps = await resolveAddressTableKeys(lookups)
    accountKeys = accountKeys.concat(resolvedLookUps)
    console.log('getting parsed:', instructions, accountKeys)
    // getting mints
    let inAmount = undefined
    let outAmount = undefined
    let inputMint = undefined
    let outputMint = undefined
    let authority = undefined

    for (const instruction of instructions) {
      if (accountKeys[instruction.programId].equals(this.programId)) {
        const programDataArray = Object.values(instruction.programData)
        const programDataBuffer = new Uint8Array(programDataArray as any)
        const ix = this.coder.instruction.decode(
          base58.encode(programDataBuffer),
          'base58'
        )

        if (this.isRouting(ix!.name)) {
          console.log('is Routing')
          console.log('data:', ix?.data)
          inAmount = (ix?.data as any).inAmount.toNumber()
          outAmount = (ix?.data as any).quotedOutAmount.toNumber()
          console.log('inAmount:', (ix?.data as any).inAmount.toNumber())
          console.log(
            'quotedOutAmount:',
            (ix?.data as any).quotedOutAmount.toNumber()
          )

          const currentIns = IDL.instructions.find(
            instruction => instruction.name === ix?.name
          )
          console.log('currentIns:', currentIns)
          console.log('ix:', ix)
          const userAuthorityIndex = currentIns?.accounts.findIndex(
            account => account.name === 'userTransferAuthority'
          )
          authority =
            accountKeys[instruction.accounts[userAuthorityIndex!]].toString()
          console.log('instruction:', instruction)

          const dstMintIndex = currentIns?.accounts.findIndex(
            account => account.name === 'destinationMint'
          )
          console.log('dstMintIndex:', dstMintIndex)
          console.log(
            'instruction.accounts[dstMintIndex!]:',
            instruction.accounts[dstMintIndex!]
          )
          console.log(
            'accountKeys:',
            accountKeys.map(key => key.toString())
          )

          outputMint =
            accountKeys[instruction.accounts[dstMintIndex!]].toString()
          console.log('output Mint:', outputMint)
          const sourceTokenAccountIndex = currentIns?.accounts.findIndex(
            account => account.name === 'sourceTokenAccount'
          )

          const connection = new Connection(chainRpcUrl.Solana)
          const inputAccountInfo = await connection.getParsedAccountInfo(
            accountKeys[instruction.accounts[sourceTokenAccountIndex!]]
          )

          console.log('inputaccoutInfo', inputAccountInfo)

          inputMint = (inputAccountInfo.value!.data as any).parsed.info.mint
          console.log('input:', inputMint)
        }
      }
    }

    return { authority, inputMint, outputMint, inAmount, outAmount }
  }

  getInitialAndFinalSwapPositions(
    instructions: PartialInstruction[],
    accountKeys: PublicKey[],
    lookups: AddressTableLookup[]
  ) {
    for (const instruction of instructions) {
      if (!accountKeys[instruction.programId].equals(this.programId)) {
        continue
      }
      const programDataArray = Object.values(instruction.programData)
      const programDataBuffer = new Uint8Array(programDataArray as any)
      console.log('before ix')
      console.log('instruction:', instruction)
      try {
        const ix = this.coder.instruction.decode(
          base58.encode(programDataBuffer),
          'base58'
        )
        console.log('ix:', ix)

        if (!ix) {
          continue
        }

        if (this.isRouting(ix.name)) {
          console.log('getting positions', ix)

          const routePlan = (ix.data as any).routePlan as RoutePlan

          console.log('routePlan:', routePlan)

          const inputIndex = 0
          const outputIndex = routePlan.length
          console.log('routePlan.length:', routePlan.length)

          const initialPositions: number[] = []
          for (let j = 0; j < routePlan.length; j++) {
            if (routePlan[j].inputIndex === inputIndex) {
              initialPositions.push(j)
            }
          }

          const finalPositions: number[] = []
          for (let j = 0; j < routePlan.length; j++) {
            console.log('routePlan[j].outputIndex:', routePlan[j].outputIndex)
            console.log('outputIndex:', outputIndex)

            if (routePlan[j].outputIndex === outputIndex) {
              finalPositions.push(j)
            }
          }

          if (
            finalPositions.length === 0 &&
            this.isCircular((ix.data as any).routePlan)
          ) {
            for (let j = 0; j < (ix.data as any).routePlan.length; j++) {
              if ((ix.data as any).routePlan[j].outputIndex === 0) {
                finalPositions.push(j)
              }
            }
          }
          console.log('comp initialPositions:', initialPositions)
          console.log('comp finalPositions:', finalPositions)
          console.log('initialPositions:', initialPositions[0])
          console.log('finalPositions:', finalPositions[0])
          this.getInoutMintAddresses(
            [
              routePlan[initialPositions[0]].inputIndex,
              routePlan[finalPositions[0]].outputIndex,
            ],
            instructions,
            accountKeys,
            lookups
          )

          return [initialPositions, finalPositions]
        }
      } catch {
        continue
      }
    }
  }

  async getInoutMintAddresses(
    inout: number[],
    instructions: PartialInstruction[],
    accountKeys: PublicKey[],
    lookups: AddressTableLookup[]
  ) {
    let inputMint,
      outputMint = undefined

    const resolvedLookUps = await resolveAddressTableKeys(lookups)

    const inputAccountAddress = accountKeys[inout[0]]
    console.log('inputAccountAddress:', inputAccountAddress.toString())

    const outputAccountAddress = accountKeys[inout[1]]
    console.log('outputAccountAddress:', outputAccountAddress.toString())

    const connection = new Connection(chainRpcUrl.Solana)

    const inputAccountInfo =
      await connection.getParsedAccountInfo(inputAccountAddress)
    if (
      inputAccountInfo.value?.owner.toString() ===
      '11111111111111111111111111111111'
    ) {
      inputMint = inputAccountAddress
    } else if ((inputAccountInfo.value?.data as any).parsed.info.mint) {
      inputMint = (inputAccountInfo.value?.data as any).parsed.info.mint
    }
    console.log('inputAccountInfo:', inputAccountInfo)
    console.log(
      'inputAccountInfo ownder:',
      inputAccountInfo.value?.owner.toString()
    )
    const outputAccountInfo =
      await connection.getParsedAccountInfo(outputAccountAddress)
    console.log('outputAccountInfo:', outputAccountInfo)
    console.log(
      'outputAccountInfo owner:',
      outputAccountInfo.value?.owner.toString()
    )
    if (outputAccountInfo.value === null) {
      const ataInstructionIndex = accountKeys.findIndex(key =>
        key.equals(ASSOCIATED_TOKEN_PROGRAM_ID)
      )
      console.log('ataInstructionIndex:', ataInstructionIndex)

      if (ataInstructionIndex === -1) {
        const concatedAccountKeys = accountKeys.concat(resolvedLookUps)
        const accountInfos = await connection.getMultipleParsedAccounts(
          concatedAccountKeys!
        )
        const filteredAccounts = accountInfos.value.filter(
          info =>
            info?.data &&
            (info.data as any).program === 'spl-token' &&
            (info?.data as any).parsed.info.mint &&
            (info?.data as any).parsed.info.mint != NATIVE_MINT.toString()
        )
        console.log('filteredAccounts:', filteredAccounts)

        const filterSet = new Set(
          filteredAccounts.map(
            account => (account?.data as any).parsed.info.mint
          )
        )
        console.log('filterSet:', filterSet)
        console.log('output mint:', [...filterSet][filterSet.size - 1])
      } else {
        const ataInstruction = instructions.find(
          ({ programId }) => programId === ataInstructionIndex
        )
        console.log('ataInstruction:', ataInstruction)
        const tokenIndex = ataInstruction!.accounts[3]

        console.log('tokenIndex :', tokenIndex)

        if (accountKeys[tokenIndex]) {
          console.log(
            'mint address existed:',
            accountKeys[tokenIndex].toString()
          )
        } else {
          console.log('mint address not Found')

          console.log('resolvedLookUps:', resolvedLookUps)
          console.log(
            'tokenIndex - accountKeys.length:',
            tokenIndex - accountKeys.length
          )

          console.log(
            'resolved mint:',
            resolvedLookUps[tokenIndex - accountKeys.length].toString()
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

  isCircular(routePlan: RoutePlan) {
    if (!routePlan || routePlan.length === 0) {
      return false
    }

    const indexMap = new Map(
      routePlan.map(obj => [obj.inputIndex, obj.outputIndex])
    )
    let visited = new Set()
    let currentIndex = routePlan[0].inputIndex

    while (true) {
      if (visited.has(currentIndex)) {
        return currentIndex === routePlan[0].inputIndex
      }

      visited.add(currentIndex)

      if (!indexMap.has(currentIndex)) {
        return false
      }

      currentIndex = indexMap.get(currentIndex)!
    }
  }
}
