import { handleAddChain } from './handlers/addChain'
import { handleAddCoin } from './handlers/addCoin'
import {
  handleAddAddressBookEntry,
  handleGetAddressBook,
  handleRemoveAddressBookEntry,
} from './handlers/addressBook'
import { handleAssetLookup } from './handlers/assetLookup'
import { handleBuildCustomTx } from './handlers/buildCustomTx'
import { handleBuildSendTx } from './handlers/buildSendTx'
import { handleBuildSwapTx } from './handlers/buildSwapTx'
import { handleGetBalances } from './handlers/getBalances'
import { handleGetChainAddress } from './handlers/getChainAddress'
import { handleGetChains } from './handlers/getChains'
import { handleGetCoins } from './handlers/getCoins'
import { handleGetPortfolio } from './handlers/getPortfolio'
import { handleListVaults } from './handlers/listVaults'
import { handleMarketPrice } from './handlers/marketPrice'
import { handleMcpStatus } from './handlers/mcpStatus'
import { handlePluginInstall } from './handlers/pluginInstall'
import { handlePluginInstalled } from './handlers/pluginInstalled'
import { handlePluginList } from './handlers/pluginList'
import { handlePluginSpec } from './handlers/pluginSpec'
import { handlePluginUninstall } from './handlers/pluginUninstall'
import { handlePolicyAdd } from './handlers/policyAdd'
import { handlePolicyDelete } from './handlers/policyDelete'
import { handlePolicyGenerate } from './handlers/policyGenerate'
import { handlePolicyList } from './handlers/policyList'
import { handlePolicyStatus } from './handlers/policyStatus'
import { handleReadEvmContract } from './handlers/readEvmContract'
import { handleRemoveChain } from './handlers/removeChain'
import { handleRemoveCoin } from './handlers/removeCoin'
import { handleScanTx } from './handlers/scanTx'
import { handleSearchToken } from './handlers/searchToken'
import { handleSignInStatus } from './handlers/signInStatus'
import { handleSignTx } from './handlers/signTx'
import { handleSignTypedData } from './handlers/signTypedData'
import { handleThorchainQuery } from './handlers/thorchainQuery'
import { handleTransactionHistory } from './handlers/transactionHistory'
import { handleVaultInfo } from './handlers/vaultInfo'
import type { ToolHandler } from './types'

export const toolHandlers: Record<string, ToolHandler> = {
  vault_info: handleVaultInfo,
  get_chains: handleGetChains,
  get_chain_address: handleGetChainAddress,
  get_coins: handleGetCoins,
  get_balances: handleGetBalances,
  get_portfolio: handleGetPortfolio,
  add_coin: handleAddCoin,
  add_chain: handleAddChain,
  remove_coin: handleRemoveCoin,
  remove_chain: handleRemoveChain,
  list_vaults: handleListVaults,
  get_address_book: handleGetAddressBook,
  add_address_book_entry: handleAddAddressBookEntry,
  remove_address_book_entry: handleRemoveAddressBookEntry,
  sign_in_status: handleSignInStatus,
  plugin_list: handlePluginList,
  plugin_spec: handlePluginSpec,
  plugin_installed: handlePluginInstalled,
  plugin_install: handlePluginInstall,
  plugin_uninstall: handlePluginUninstall,
  policy_list: handlePolicyList,
  policy_status: handlePolicyStatus,
  policy_add: handlePolicyAdd,
  policy_delete: handlePolicyDelete,
  transaction_history: handleTransactionHistory,
  get_market_price: handleMarketPrice,
  asset_lookup: handleAssetLookup,
  policy_generate: handlePolicyGenerate,
  search_token: handleSearchToken,
  read_evm_contract: handleReadEvmContract,
  scan_tx: handleScanTx,
  sign_tx: handleSignTx,
  sign_typed_data: handleSignTypedData,
  build_swap_tx: handleBuildSwapTx,
  build_send_tx: handleBuildSendTx,
  build_custom_tx: handleBuildCustomTx,
  thorchain_query: handleThorchainQuery,
  mcp_status: handleMcpStatus,
}
