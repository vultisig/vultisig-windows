import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { CopyButton } from '../CopyButton'
import { ToolAction, toRecord } from '../types'

type PolicyAddData = {
  success?: boolean
  policy_id?: string
  plugin_id?: string
  plugin_name?: string
  from_asset?: string
  from_chain?: string
  to_asset?: string
  to_chain?: string
  amount?: string
  frequency?: string
  message?: string
  configuration?: Record<string, unknown>
  ui?: {
    actions?: ToolAction[]
  }
}

type Props = {
  data: unknown
}

const isPolicyAddData = (data: unknown): data is PolicyAddData => {
  if (typeof data !== 'object' || data === null) return false
  return true
}

const getPluginIcon = (pluginName?: string): string => {
  const name = pluginName?.toLowerCase() || ''
  if (name.includes('swap') || name.includes('dca')) return '🔄'
  if (name.includes('send')) return '📤'
  if (name.includes('fee')) return '💰'
  return '📋'
}

const extractFromConfig = (
  config: Record<string, unknown> | null,
  field: string
): Record<string, unknown> | null => {
  if (!config) return null
  const val = config[field]
  if (typeof val === 'object' && val !== null) {
    return val as Record<string, unknown>
  }
  return null
}

export const PolicyAddResult: FC<Props> = ({ data }) => {
  if (!isPolicyAddData(data)) {
    return null
  }

  const configuration = toRecord(data.configuration)
  const configFrom = extractFromConfig(configuration, 'from')
  const configTo = extractFromConfig(configuration, 'to')

  const fromAsset =
    data.from_asset ||
    (typeof configFrom?.chain === 'string' ? configFrom.chain : undefined)
  const fromChain =
    data.from_chain ||
    (typeof configFrom?.chain === 'string' ? configFrom.chain : undefined)
  const toAsset =
    data.to_asset ||
    (typeof configTo?.chain === 'string' ? configTo.chain : undefined)
  const toChain =
    data.to_chain ||
    (typeof configTo?.chain === 'string' ? configTo.chain : undefined)
  const amount =
    data.amount ||
    (typeof configuration?.fromAmount === 'string'
      ? configuration.fromAmount
      : undefined)
  const frequency =
    data.frequency ||
    (typeof configuration?.frequency === 'string'
      ? configuration.frequency
      : undefined)

  const pluginName = data.plugin_name
  const policyId = data.policy_id
  const ui = toRecord(data.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  return (
    <Container>
      <VStack gap={16}>
        <Header>
          <HStack gap={8} alignItems="center">
            <SuccessIcon>✓</SuccessIcon>
            <Text size={14} weight={600} color="regular">
              Policy Created
            </Text>
          </HStack>
        </Header>

        <VStack gap={12}>
          <InfoRow>
            <Text size={13} color="shy">
              Plugin
            </Text>
            <HStack gap={6} alignItems="center">
              <PluginIcon>{getPluginIcon(pluginName)}</PluginIcon>
              <Text size={13} color="regular" weight={500}>
                {pluginName || 'Policy'}
              </Text>
            </HStack>
          </InfoRow>

          {fromAsset && (
            <InfoRow>
              <Text size={13} color="shy">
                From
              </Text>
              <Text size={13} color="regular">
                {amount ? `${amount} ` : ''}
                {fromAsset}
                {fromChain && fromChain !== fromAsset && ` (${fromChain})`}
              </Text>
            </InfoRow>
          )}

          {toAsset && (
            <InfoRow>
              <Text size={13} color="shy">
                To
              </Text>
              <Text size={13} color="regular">
                {toAsset}
                {toChain && toChain !== toAsset && ` (${toChain})`}
              </Text>
            </InfoRow>
          )}

          {frequency && (
            <InfoRow>
              <Text size={13} color="shy">
                Frequency
              </Text>
              <Text size={13} color="regular">
                {frequency}
              </Text>
            </InfoRow>
          )}

          {policyId && (
            <InfoRow>
              <Text size={13} color="shy">
                Policy ID
              </Text>
              <HStack gap={4} alignItems="center">
                <Text size={12} color="supporting" family="mono">
                  {policyId.length > 16
                    ? `${policyId.slice(0, 8)}...${policyId.slice(-8)}`
                    : policyId}
                </Text>
                <CopyButton value={policyId} label="Policy ID copied" />
              </HStack>
            </InfoRow>
          )}
        </VStack>

        <Footer>
          <ActionBar actions={actions} />
        </Footer>
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  background: ${getColor('foreground')};
  border-radius: 8px;
  border: 1px solid ${getColor('mist')};
  overflow: hidden;
`

const Header = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${getColor('mist')};
`

const SuccessIcon = styled.span`
  color: ${getColor('primary')};
  font-size: 14px;
  font-weight: 600;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
`

const PluginIcon = styled.span`
  font-size: 16px;
`

const Footer = styled.div`
  padding: 12px 16px;
  background: ${getColor('background')};
`
