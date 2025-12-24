import { getEthAccounts } from './resolvers/eth_accounts'
import { getEthBlockNumber } from './resolvers/eth_blockNumber'
import { callEth } from './resolvers/eth_call'
import { getEthChainId } from './resolvers/eth_chainId'
import { estimateEthGas } from './resolvers/eth_estimateGas'
import { getEthGasPrice } from './resolvers/eth_gasPrice'
import { getEthBalance } from './resolvers/eth_getBalance'
import { getEthBlockByNumber } from './resolvers/eth_getBlockByNumber'
import { getEthCode } from './resolvers/eth_getCode'
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
import { getWalletPermissions } from './resolvers/wallet_getPermissions'
import { requestWalletPermissions } from './resolvers/wallet_requestPermissions'
import { revokeWalletPermissions } from './resolvers/wallet_revokePermissions'
import { switchEthereumChain } from './resolvers/wallet_switchEthereumChain'

export { processSignature } from './utils'

export const ethereumHandlers = {
  eth_chainId: getEthChainId,
  eth_accounts: getEthAccounts,
  eth_requestAccounts: requestEthAccounts,
  wallet_switchEthereumChain: switchEthereumChain,
  wallet_addEthereumChain: addEthereumChain,
  wallet_getPermissions: getWalletPermissions,
  wallet_requestPermissions: requestWalletPermissions,
  wallet_revokePermissions: revokeWalletPermissions,
  net_version: getNetVersion,
  eth_getCode: getEthCode,
  eth_getTransactionCount: getEthTransactionCount,
  eth_getBalance: getEthBalance,
  eth_blockNumber: getEthBlockNumber,
  eth_getBlockByNumber: getEthBlockByNumber,
  eth_gasPrice: getEthGasPrice,
  eth_maxPriorityFeePerGas: getEthMaxPriorityFeePerGas,
  eth_estimateGas: estimateEthGas,
  eth_call: callEth,
  eth_getTransactionReceipt: getEthTransactionReceipt,
  eth_getTransactionByHash: getEthTransactionByHash,
  eth_signTypedData_v4: signEthTypedDataV4,
  personal_sign: personalSign,
  eth_sendTransaction: sendEthTransaction,
} as const
