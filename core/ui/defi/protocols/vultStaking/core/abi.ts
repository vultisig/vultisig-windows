/**
 * Minimal sVULT ABI fragments used for on-chain reads. The verified contract has
 * no getter that enumerates a user's unstake requests, so pending requests are
 * discovered via `UnstakeRequested` logs (filtered by the indexed `owner`) and
 * then resolved one-by-one through `getUnstakeRequest` / `isClaimable`.
 */
export const sVultAbi = [
  {
    type: 'function',
    name: 'cooldownDuration',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getUnstakeRequest',
    stateMutability: 'view',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'maturity', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'isClaimable',
    stateMutability: 'view',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'event',
    name: 'UnstakeRequested',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'requestId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'maturity', type: 'uint256', indexed: false },
    ],
  },
] as const
