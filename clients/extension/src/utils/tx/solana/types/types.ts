import { IdlEvents, IdlTypes } from '@coral-xyz/anchor'
import { Jupiter } from '../idl/jupiter'
import { ParsedInstruction, PublicKey } from '@solana/web3.js'

export type SwapEvent = IdlEvents<Jupiter>['SwapEvent']
export type FeeEvent = IdlEvents<Jupiter>['FeeEvent']
type RoutePlanStep = IdlTypes<Jupiter>['RoutePlanStep']
export type RoutePlan = RoutePlanStep[]

export interface PartialInstruction {
  programId: any
  programData: Uint8Array
  accounts: any
}
