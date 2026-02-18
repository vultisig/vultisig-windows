import { handleAddChain } from './handlers/addChain'
import { handleAddCoin } from './handlers/addCoin'
import {
  handleAddAddressBookEntry,
  handleGetAddressBook,
  handleRemoveAddressBookEntry,
} from './handlers/addressBook'
import { handleAssetLookup } from './handlers/assetLookup'
import { handleBroadcastTx } from './handlers/broadcastTx'
import { handleGetChainAddress } from './handlers/getChainAddress'
import { handleGetChains } from './handlers/getChains'
import { handleGetCoins } from './handlers/getCoins'
import { handleInitiateSend } from './handlers/initiateSend'
import { handleListVaults } from './handlers/listVaults'
import { handleMarketPrice } from './handlers/marketPrice'
import { handlePluginInstalled } from './handlers/pluginInstalled'
import { handlePluginList } from './handlers/pluginList'
import { handlePluginSpec } from './handlers/pluginSpec'
import { handlePluginUninstall } from './handlers/pluginUninstall'
import { handlePolicyGenerate } from './handlers/policyGenerate'
import { handlePolicyList } from './handlers/policyList'
import { handlePolicyStatus } from './handlers/policyStatus'
import { handleRemoveChain } from './handlers/removeChain'
import { handleRemoveCoin } from './handlers/removeCoin'
import { handleScanTx } from './handlers/scanTx'
import { handleSearchToken } from './handlers/searchToken'
import { handleSignInStatus } from './handlers/signInStatus'
import { handleTransactionHistory } from './handlers/transactionHistory'
import { handleVaultInfo } from './handlers/vaultInfo'
import type { ToolHandler } from './types'

export const toolHandlers: Record<string, ToolHandler> = {
  vault_info: handleVaultInfo,
  get_chains: handleGetChains,
  get_chain_address: handleGetChainAddress,
  get_coins: handleGetCoins,
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
  plugin_uninstall: handlePluginUninstall,
  policy_list: handlePolicyList,
  policy_status: handlePolicyStatus,
  transaction_history: handleTransactionHistory,
  get_market_price: handleMarketPrice,
  asset_lookup: handleAssetLookup,
  initiate_send: handleInitiateSend,
  policy_generate: handlePolicyGenerate,
  search_token: handleSearchToken,
  scan_tx: handleScanTx,
  broadcast_tx: handleBroadcastTx,
}
