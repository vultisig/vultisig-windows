import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import {
  ActionResult,
  AddressBookResult,
  AssetLookupResult,
  ChainAddressResult,
  ChainsListResult,
  CoinsListResult,
  PluginInstalledResult,
  PluginInstallResult,
  PluginListResult,
  PluginSpecResult,
  PolicyAddResult,
  PolicyDetailsResult,
  PolicyListResult,
  PolicyPreviewResult,
  PolicyStatusResult,
  PortfolioResult,
  SuccessResult,
  VaultInfoResult,
  VaultsListResult,
} from './renderers'

type Props = {
  toolName: string
  output: unknown
}

export const ToolOutputRenderer: FC<Props> = ({ toolName, output }) => {
  const result = renderToolOutput(toolName, output)

  if (result) {
    return result
  }

  return <JsonFallback data={output} />
}

const renderToolOutput = (
  toolName: string,
  output: unknown
): React.ReactNode | null => {
  switch (toolName) {
    case 'get_chain_address':
      return <ChainAddressResult data={output} />

    case 'get_chains':
      return <ChainsListResult data={output} />

    case 'get_coins':
    case 'get_balances':
      return <CoinsListResult data={output} />

    case 'get_portfolio':
      return <PortfolioResult data={output} />

    case 'vault_info':
      return <VaultInfoResult data={output} />

    case 'list_vaults':
      return <VaultsListResult data={output} />

    case 'get_address_book':
      return <AddressBookResult data={output} />

    case 'add_coin':
      return <SuccessResult data={output} action="add" entityType="coin" />

    case 'remove_coin':
      return <SuccessResult data={output} action="remove" entityType="coin" />

    case 'add_address_book_entry':
      return <SuccessResult data={output} action="add" entityType="address" />

    case 'remove_address_book_entry':
      return (
        <SuccessResult data={output} action="remove" entityType="address" />
      )

    case 'rename_vault':
      return <SuccessResult data={output} action="rename" entityType="vault" />

    case 'plugin_list':
      return <PluginListResult data={output} />

    case 'plugin_spec':
      return <PluginSpecResult data={output} />

    case 'plugin_install':
      return <PluginInstallResult data={output} />

    case 'plugin_installed':
      return <PluginInstalledResult data={output} />

    case 'plugin_uninstall':
      return <SuccessResult data={output} action="delete" entityType="plugin" />

    case 'asset_lookup':
      return <AssetLookupResult data={output} />

    case 'policy_list':
      return <PolicyListResult data={output} />

    case 'policy_add':
      return <PolicyAddResult data={output} />

    case 'policy_delete':
      return <SuccessResult data={output} action="delete" entityType="policy" />

    case 'policy_status':
      return <PolicyDetailsResult data={output} />

    case 'transaction_history':
      return <PolicyStatusResult data={output} />

    case 'policy_generate':
      return <PolicyPreviewResult data={output} />

    case 'initiate_send':
      return <ActionResult data={output} title="Send Ready" />

    case 'initiate_swap':
      return <ActionResult data={output} title="Swap Ready" />

    default:
      return null
  }
}

const JsonFallback: FC<{ data: unknown }> = ({ data }) => {
  const json = JSON.stringify(data, null, 2) || ''
  const maxLength = 1800
  const isTrimmed = json.length > maxLength
  const display = isTrimmed ? `${json.slice(0, maxLength)}\n…` : json

  return (
    <FallbackContainer>
      <Text size={10} color="supporting" family="mono">
        {display}
      </Text>
    </FallbackContainer>
  )
}

const FallbackContainer = styled.pre`
  margin: 0;
  padding: 8px;
  background: ${getColor('background')};
  border-radius: 4px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
`
