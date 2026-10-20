import type { ethereumHandlers } from './handlers'

type ParamCheck = (value: unknown) => boolean

const isAnything: ParamCheck = () => true

const isString: ParamCheck = value => typeof value === 'string'

const isPresent: ParamCheck = value => value !== undefined && value !== null

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Positional params: an array whose leading elements pass `checks` in order.
 * Trailing optional positions are left for the resolver or node to default.
 */
const positional =
  (...checks: ParamCheck[]): ParamCheck =>
  params =>
    Array.isArray(params) &&
    checks.every((check, index) => check(params[index]))

const isChainParams = positional(
  value => isPlainObject(value) && isString(value.chainId)
)

const ethereumParamChecks: Record<keyof typeof ethereumHandlers, ParamCheck> = {
  eth_chainId: isAnything,
  eth_accounts: isAnything,
  eth_requestAccounts: isAnything,
  wallet_switchEthereumChain: isChainParams,
  wallet_getCapabilities: isAnything,
  wallet_addEthereumChain: isChainParams,
  wallet_watchAsset: params =>
    isPlainObject(params) && isPlainObject(params.options),
  wallet_getPermissions: isAnything,
  wallet_requestPermissions: params =>
    params === undefined ||
    (Array.isArray(params) &&
      (params[0] === undefined || isPlainObject(params[0]))),
  wallet_revokePermissions: isAnything,
  net_version: isAnything,
  eth_getCode: positional(isString),
  eth_getTransactionCount: positional(isString),
  eth_getBalance: positional(isString),
  eth_blockNumber: isAnything,
  eth_getBlockByHash: positional(isString),
  eth_getBlockByNumber: positional(isString),
  eth_feeHistory: positional(isPresent, isPresent),
  eth_gasPrice: isAnything,
  eth_getLogs: positional(isPlainObject),
  eth_getStorageAt: positional(isString, isString),
  eth_maxPriorityFeePerGas: isAnything,
  eth_estimateGas: positional(isPlainObject),
  eth_call: positional(isPlainObject),
  eth_getTransactionReceipt: positional(isString),
  eth_getTransactionByHash: positional(isString),
  eth_signTypedData: positional(),
  eth_signTypedData_v3: positional(),
  eth_signTypedData_v4: positional(),
  personal_sign: positional(isString),
  eth_sendTransaction: positional(isPlainObject),
}

type HasValidEthereumParamsInput = {
  method: keyof typeof ethereumHandlers
  params: unknown
}

/**
 * Checks that a request's `params` has the structure its resolver
 * destructures — required positions present and of the right kind — so a
 * malformed request can be rejected as invalid params instead of crashing the
 * resolver. Values themselves (chain ids, addresses, payloads) are still
 * validated by the resolvers.
 */
export const hasValidEthereumParams = ({
  method,
  params,
}: HasValidEthereumParamsInput) => ethereumParamChecks[method](params)
