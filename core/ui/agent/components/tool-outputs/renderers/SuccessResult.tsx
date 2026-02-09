import { Chain } from '@core/chain/Chain'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { ChainIcon } from '../ChainIcon'
import { CopyButton } from '../CopyButton'
import { SuccessCard } from '../SuccessCard'
import { ToolAction, toRecord } from '../types'

type SuccessData = {
  success?: boolean
  message?: string
  coin?: {
    ticker: string
    chain: string
    contractAddress?: string
    logo?: string
  }
  address?: {
    title: string
    chain: string
    address: string
  }
  policy?: {
    id: string
    pluginType?: string
    description?: string
    amount?: string
    schedule?: string
    fromAsset?: string
    toAsset?: string
  }
  oldName?: string
  newName?: string
  old_name?: string
  new_name?: string
  ticker?: string
  chain?: string
  contract_address?: string
  title?: string
  plugin_name?: string
  policy_id?: string
  ui?: {
    actions?: ToolAction[]
  }
}

type Props = {
  data: unknown
  action: 'add' | 'remove' | 'rename' | 'create' | 'delete'
  entityType: 'coin' | 'address' | 'policy' | 'vault' | 'plugin'
}

const isSuccessData = (data: unknown): data is SuccessData => {
  if (typeof data !== 'object' || data === null) return false
  return true
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

const getTitle = (
  action: string,
  entityType: string,
  _data: SuccessData
): string => {
  if (action === 'rename' && entityType === 'vault') {
    return 'Vault Renamed'
  }
  const actionLabels: Record<string, string> = {
    add: 'Added',
    remove: 'Removed',
    create: 'Created',
    delete: 'Deleted',
    rename: 'Renamed',
  }
  const entityLabels: Record<string, string> = {
    coin: 'Coin',
    address: 'Address',
    policy: 'Policy',
    vault: 'Vault',
    plugin: 'Plugin',
  }
  return `${entityLabels[entityType] || 'Item'} ${actionLabels[action] || action}`
}

export const SuccessResult: FC<Props> = ({ data, action, entityType }) => {
  if (!isSuccessData(data)) {
    return null
  }

  const oldName = data.oldName || data.old_name
  const newName = data.newName || data.new_name
  const ui = toRecord(data.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  const coin =
    data.coin ||
    (data.ticker && data.chain
      ? {
          ticker: data.ticker,
          chain: data.chain,
          contractAddress: data.contract_address,
        }
      : undefined)

  const address =
    data.address ||
    (data.title && data.chain && typeof data.address === 'string'
      ? {
          title: data.title,
          chain: data.chain,
          address: data.address,
        }
      : undefined)

  const policy =
    data.policy ||
    (data.policy_id
      ? {
          id: data.policy_id,
          pluginType: data.plugin_name,
          description: data.message,
        }
      : undefined)

  const title = getTitle(action, entityType, data)

  return (
    <SuccessCard title={title}>
      {entityType === 'vault' && action === 'rename' && oldName && newName && (
        <HStack gap={8} alignItems="center">
          <Text size={13} color="shy">
            &quot;{oldName}&quot;
          </Text>
          <Text size={13} color="supporting">
            →
          </Text>
          <Text size={13} color="regular" weight={500}>
            &quot;{newName}&quot;
          </Text>
        </HStack>
      )}

      {entityType === 'coin' && coin && <CoinDisplay coin={coin} />}

      {entityType === 'address' && address && (
        <AddressEntryDisplay entry={address} />
      )}

      {entityType === 'policy' && policy && <PolicyDisplay policy={policy} />}

      {!coin && !address && !policy && data.message && (
        <Text size={13} color="shy">
          {data.message}
        </Text>
      )}

      <ActionBar actions={actions} />
    </SuccessCard>
  )
}

const CoinDisplay: FC<{
  coin: NonNullable<SuccessData['coin']>
}> = ({ coin }) => {
  const chain = getChainFromString(coin.chain)
  const coinKey = chain
    ? { chain, id: coin.contractAddress || coin.ticker }
    : null

  return (
    <HStack gap={12} alignItems="center">
      {coinKey && (
        <IconContainer>
          <CoinIcon coin={{ ...coinKey, logo: coin.logo || '' }} />
        </IconContainer>
      )}
      <VStack gap={2}>
        <HStack gap={8} alignItems="center">
          <Text size={14} weight={500} color="regular">
            {coin.ticker}
          </Text>
          <Text size={13} color="shy">
            on {coin.chain}
          </Text>
        </HStack>
        {coin.contractAddress && (
          <HStack gap={4} alignItems="center">
            <MiddleTruncate
              text={coin.contractAddress}
              color="textShy"
              size={12}
              width={150}
            />
            <CopyButton value={coin.contractAddress} label="Address copied" />
          </HStack>
        )}
      </VStack>
    </HStack>
  )
}

const AddressEntryDisplay: FC<{
  entry: NonNullable<SuccessData['address']>
}> = ({ entry }) => {
  const chain = getChainFromString(entry.chain)

  return (
    <HStack gap={12} alignItems="center">
      {chain && (
        <IconContainer>
          <ChainIcon chain={chain} size={24} />
        </IconContainer>
      )}
      <VStack gap={2}>
        <HStack gap={8} alignItems="center">
          <Text size={14} weight={500} color="regular">
            {entry.title}
          </Text>
          <Text size={13} color="shy">
            on {entry.chain}
          </Text>
        </HStack>
        <HStack gap={4} alignItems="center">
          <MiddleTruncate
            text={entry.address}
            color="textShy"
            size={12}
            width={150}
          />
          <CopyButton value={entry.address} label="Address copied" />
        </HStack>
      </VStack>
    </HStack>
  )
}

const PolicyDisplay: FC<{
  policy: NonNullable<SuccessData['policy']>
}> = ({ policy }) => {
  const getPluginIcon = (pluginType?: string): string => {
    const type = pluginType?.toLowerCase() || ''
    if (type.includes('swap') || type.includes('dca')) return '🔄'
    if (type.includes('send')) return '📤'
    if (type.includes('fee')) return '💰'
    return '📋'
  }

  return (
    <VStack gap={8}>
      <HStack gap={8} alignItems="center">
        <span style={{ fontSize: 20 }}>{getPluginIcon(policy.pluginType)}</span>
        <Text size={14} weight={500} color="regular">
          {policy.description ||
            `${policy.pluginType || 'Policy'}${
              policy.fromAsset && policy.toAsset
                ? ` ${policy.fromAsset} → ${policy.toAsset}`
                : ''
            }`}
        </Text>
      </HStack>
      {policy.amount && policy.schedule && (
        <Text size={13} color="shy">
          Amount: {policy.amount} · {policy.schedule}
        </Text>
      )}
      <HStack gap={4} alignItems="center">
        <Text size={12} color="shy" family="mono">
          Policy ID: {policy.id}
        </Text>
        <CopyButton value={policy.id} label="Policy ID copied" />
      </HStack>
    </VStack>
  )
}

const IconContainer = styled.div`
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`
