import { TokenApproval } from './TokenApproval'

/** The approvals found on one chain. */
export type ChainApprovals = {
  approvals: TokenApproval[]
  /** False when part of the lookup failed, so approvals may be missing. */
  isComplete: boolean
}
