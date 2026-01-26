import { getEthAccounts } from './resolvers/eth_accounts'
import { getEthBlockNumber } from './resolvers/eth_blockNumber'
import { callEth } from './resolvers/eth_call'
import { getEthChainId } from './resolvers/eth_chainId'
import { estimateEthGas } from './resolvers/eth_estimateGas'
import { getEthFeeHistory } from './resolvers/eth_feeHistory'
import { getEthGasPrice } from './resolvers/eth_gasPrice'
import { getEthBalance } from './resolvers/eth_getBalance'
import { getEthBlockByHash } from './resolvers/eth_getBlockByHash'
import { getEthBlockByNumber } from './resolvers/eth_getBlockByNumber'
import { getEthCode } from './resolvers/eth_getCode'
import { getEthLogs } from './resolvers/eth_getLogs'
import { getEthStorageAt } from './resolvers/eth_getStorageAt'
import { getEthTransactionByHash } from './resolvers/eth_getTransactionByHash'
import { getEthTransactionCount } from './resolvers/eth_getTransactionCount'
import { getEthTransactionReceipt } from './resolvers/eth_getTransactionReceipt'
import { getEthMaxPriorityFeePerGas } from './resolvers/eth_maxPriorityFeePerGas'
import { requestEthAccounts } from './resolvers/eth_requestAccounts'
import { sendEthTransaction } from './resolvers/eth_sendTransaction'
import { signEthTypedDataV4 } from './resolvers/eth_signTypedData_v4'
import { getNetVersion } from './resolvers/net_version'
import { personalSign } from './resolvers/personal_sign'
import { addEthereumChain } from './resolvers/wallet_addEthereumChain'
import { getWalletCapabilities } from './resolvers/wallet_getCapabilities'
import { getWalletPermissions } from './resolvers/wallet_getPermissions'
import { requestWalletPermissions } from './resolvers/wallet_requestPermissions'
import { revokeWalletPermissions } from './resolvers/wallet_revokePermissions'
import { switchEthereumChain } from './resolvers/wallet_switchEthereumChain'
import { watchAsset } from './resolvers/wallet_watchAsset'

export { processSignature } from './utils'

export const ethereumHandlers = {
  eth_chainId: getEthChainId,
  eth_accounts: getEthAccounts,
  eth_requestAccounts: requestEthAccounts,
  wallet_switchEthereumChain: switchEthereumChain,
  wallet_getCapabilities: getWalletCapabilities,
  wallet_addEthereumChain: addEthereumChain,
  wallet_watchAsset: watchAsset,
  wallet_getPermissions: getWalletPermissions,
  wallet_requestPermissions: requestWalletPermissions,
  wallet_revokePermissions: revokeWalletPermissions,
  net_version: getNetVersion,
  eth_getCode: getEthCode,
  eth_getTransactionCount: getEthTransactionCount,
  eth_getBalance: getEthBalance,
  eth_blockNumber: getEthBlockNumber,
  eth_getBlockByHash: getEthBlockByHash,
  eth_getBlockByNumber: getEthBlockByNumber,
  eth_feeHistory: getEthFeeHistory,
  eth_gasPrice: getEthGasPrice,
  eth_getLogs: getEthLogs,
  eth_getStorageAt: getEthStorageAt,
  eth_maxPriorityFeePerGas: getEthMaxPriorityFeePerGas,
  eth_estimateGas: estimateEthGas,
  eth_call: callEth,
  eth_getTransactionReceipt: getEthTransactionReceipt,
  eth_getTransactionByHash: getEthTransactionByHash,
  eth_signTypedData_v4: signEthTypedDataV4,
  personal_sign: personalSign,
  eth_sendTransaction: sendEthTransaction,
} as const
