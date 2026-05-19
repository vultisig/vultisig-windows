type DecodedEvmContractCall = {
  functionSignature: string
  functionArguments: string
}

type ApprovalCounterparty = {
  address: string
  /**
   * `'spender'` for ERC-20 `approve(address,uint256)`,
   * `'operator'` for ERC-721/1155 `setApprovalForAll(address,bool)`. Used as
   * the i18n key for the row title so the UI matches the right ABI vocabulary.
   */
  labelKey: 'spender' | 'operator'
}

/**
 * Pulls the address being granted allowance from a decoded EVM contract
 * call. Returns `null` when the call is not an approval, the args fail to
 * parse, or the first arg is not an address-shaped string.
 *
 * Surfacing this as its own row on the keysign verify and done screens lets
 * the user see *who* is being authorized to move their tokens — the most
 * security-relevant fact about an approval, and the one screen real estate
 * users miss most often.
 */
export const extractApprovalCounterparty = (
  info: DecodedEvmContractCall
): ApprovalCounterparty | null => {
  const fn = info.functionSignature.split('(')[0]
  if (fn !== 'approve' && fn !== 'setApprovalForAll') return null
  try {
    const args = JSON.parse(info.functionArguments)
    if (!Array.isArray(args)) return null
    const first = args[0]
    if (typeof first !== 'string') return null
    return {
      address: first,
      labelKey: fn === 'setApprovalForAll' ? 'operator' : 'spender',
    }
  } catch {
    return null
  }
}
