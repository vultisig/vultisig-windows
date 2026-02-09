import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { CopyButton } from '../CopyButton'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'
import { ToolAction, toRecord } from '../types'

type PolicyItem = {
  id: string
  pluginType?: string
  plugin_id?: string
  plugin_name?: string
  description?: string
  isActive?: boolean
  active?: boolean
  schedule?: string
  frequency?: string
  amount?: string
  fromAsset?: string
  from_asset?: string
  toAsset?: string
  to_asset?: string
  configuration?: Record<string, unknown>
}

type PolicyListData = {
  policies?: PolicyItem[]
  ui?: {
    actions?: ToolAction[]
  }
}

type Props = {
  data: unknown
}

const isPolicyListData = (data: unknown): data is PolicyListData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.policies)) return false
  return obj.policies.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as PolicyItem).id === 'string'
  )
}

const getPluginIcon = (pluginType?: string): string => {
  const type = pluginType?.toLowerCase() || ''
  if (type.includes('swap') || type.includes('dca')) return '🔄'
  if (type.includes('send')) return '📤'
  if (type.includes('fee')) return '💰'
  return '📋'
}

const getPluginDisplayName = (pluginType?: string): string => {
  const type = pluginType?.toLowerCase() || ''
  if (type.includes('dca')) return 'DCA'
  if (type.includes('swap')) return 'Recurring Swaps'
  if (type.includes('send')) return 'Recurring Sends'
  if (type.includes('fee')) return 'Fee Management'
  return pluginType || 'Policy'
}

export const PolicyListResult: FC<Props> = ({ data }) => {
  if (!isPolicyListData(data) || !data.policies) {
    return null
  }

  const ui = toRecord(data.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  return (
    <ResultPanel title="Active Policies" count={data.policies.length}>
      {data.policies.map((policy, index) => {
        const pluginType = policy.pluginType || policy.plugin_id
        const pluginName =
          policy.plugin_name || getPluginDisplayName(pluginType)
        const isActive = policy.isActive ?? policy.active ?? true
        const fromAsset = policy.fromAsset || policy.from_asset
        const toAsset = policy.toAsset || policy.to_asset
        const amount = policy.amount
        const schedule = policy.schedule || policy.frequency

        return (
          <ResultRow
            key={index}
            icon={<PolicyIcon>{getPluginIcon(pluginType)}</PolicyIcon>}
            extra={
              <HStack gap={8} alignItems="center">
                {isActive && (
                  <ActiveBadge>
                    <Text size={11} color="success">
                      ✓ Active
                    </Text>
                  </ActiveBadge>
                )}
              </HStack>
            }
          >
            <VStack gap={4}>
              <HStack gap={8} alignItems="center">
                <Text size={14} weight={500} color="regular">
                  {policy.description ||
                    `${pluginName}${
                      fromAsset && toAsset ? ` ${fromAsset} → ${toAsset}` : ''
                    }`}
                </Text>
              </HStack>
              <HStack gap={8} alignItems="center">
                {amount && schedule && (
                  <Text size={12} color="shy">
                    {amount} {schedule}
                  </Text>
                )}
                <PolicyIdContainer>
                  <Text size={11} color="shy" family="mono">
                    ID: {policy.id.slice(0, 12)}
                    {policy.id.length > 12 ? '...' : ''}
                  </Text>
                  <CopyButton value={policy.id} label="Policy ID copied" />
                </PolicyIdContainer>
              </HStack>
            </VStack>
          </ResultRow>
        )
      })}
      {actions.length > 0 && (
        <VStack style={{ padding: '12px 16px' }}>
          <ActionBar actions={actions} />
        </VStack>
      )}
    </ResultPanel>
  )
}

const PolicyIcon = styled.span`
  font-size: 20px;
`

const ActiveBadge = styled.div`
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(51, 230, 191, 0.15);
`

const PolicyIdContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`
