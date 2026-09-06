import { attempt } from '@vultisig/lib-utils/attempt'
import { decodeErrorResult, Hex, isHex, slice, toFunctionSelector } from 'viem'

/**
 * Why a swap the chain reverted failed, in terms history can explain. Only
 * reasons the user can act on are modelled — every other revert stays a plain
 * failure rather than being given an explanation it does not have.
 *
 * Listed rather than declared as a union so a stored value can be checked
 * against it: records outlive the build that wrote them, and one written by a
 * newer build carries a reason this build has no wording for.
 */
export const swapFailureReasons = ['slippage'] as const

/** A recognised swap failure, narrow enough that history has wording for it. */
export type SwapFailureReason = (typeof swapFailureReasons)[number]

/**
 * The phrases aggregators revert with when a swap executed but would have paid
 * out less than the minimum its signed calldata demanded. Matched against a
 * stripped-down form of the revert text, so `INSUFFICIENT_OUTPUT_AMOUNT`,
 * `InsufficientOutputAmount` and `"Insufficient output"` all reduce to one
 * needle.
 */
const slippageRevertNeedles = [
  'returnamountisnotenough', // 1inch, KyberSwap
  'insufficientoutput', // Uniswap V2 routers and the forks that copied them
  'toolittlereceived', // Uniswap Universal Router
  'slippage', // LI.FI's CumulativeSlippageTooHigh, and anything spelling it out
  'minreturn', // 1inch MinReturnError
  'minamountout',
  'amountoutmin',
  'lessthanexpected', // ParaSwap
  'lessthenexpected', // ParaSwap, as the contract itself spells it
]

/**
 * A custom error reaches the client as four bytes and nothing else, so the only
 * way to recognise one is to hash the signature it was declared with.
 */
const slippageErrorSignatures = [
  'ReturnAmountIsNotEnough()',
  'ReturnAmountIsNotEnough(uint256,uint256)',
  'TooLittleReceived()',
  'V2TooLittleReceived()',
  'V3TooLittleReceived()',
  'V4TooLittleReceived(uint256,uint256)',
  'InsufficientOutputAmount()',
  'CumulativeSlippageTooHigh(uint256,uint256)',
  'SlippageTooHigh(uint256,uint256)',
  // 0x encodes its rich errors the same way, so the name it declares them with
  // never reaches the client as text either.
  'IncompleteTransformERC20Error(address,uint256,uint256)',
]

const slippageErrorSelectors = new Set<string>(
  slippageErrorSignatures.map(signature =>
    toFunctionSelector(signature).toLowerCase()
  )
)

const selectorHexLength = '0x'.length + 4 * 2

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '')

const matchesSlippage = (value: string) => {
  const normalized = normalize(value)
  return slippageRevertNeedles.some(needle => normalized.includes(needle))
}

const hasSlippageErrorSelector = (data: Hex) => {
  if (data.length < selectorHexLength) return false
  return slippageErrorSelectors.has(slice(data, 0, 4).toLowerCase())
}

// `decodeErrorResult` knows Solidity's built-in `Error(string)` without an ABI,
// which is what a `require(..., "Insufficient output")` revert arrives as.
const decodeRevertText = (data: Hex) => {
  const result = attempt(() => decodeErrorResult({ data }))
  if ('error' in result) return undefined

  const [message] = result.data.args ?? []
  return typeof message === 'string' ? message : undefined
}

type GetSwapFailureReasonInput = {
  /** Everything the node and the client said about the revert. */
  text?: string
  /** The raw revert payload, when the node returned one. */
  data?: string
}

/**
 * Reads a slippage failure out of an EVM revert, from either the text a string
 * revert carries or the selector of a custom error.
 *
 * Deliberately conservative: an unrecognised revert returns `undefined` so the
 * record keeps its generic wording. Telling someone to raise their slippage
 * after a swap failed for an unrelated reason costs them another fee.
 */
export const getSwapFailureReason = ({
  text,
  data,
}: GetSwapFailureReasonInput): SwapFailureReason | undefined => {
  const revertData = isHex(data) ? data : undefined

  if (revertData && hasSlippageErrorSelector(revertData)) {
    return 'slippage'
  }

  const candidates = [text, revertData && decodeRevertText(revertData)]

  return candidates.some(value => value != null && matchesSlippage(value))
    ? 'slippage'
    : undefined
}
