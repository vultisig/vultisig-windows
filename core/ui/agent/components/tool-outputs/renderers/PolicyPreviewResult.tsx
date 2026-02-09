import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { DetailsDrawer } from '../DetailsDrawer'
import { ToolAction, toRecord } from '../types'

type PolicyPreviewData = {
  pluginType?: string
  pluginName?: string
  plugin_name?: string
  fromAsset?: string
  from_asset?: string
  fromChain?: string
  from_chain?: string
  toAsset?: string
  to_asset?: string
  toChain?: string
  to_chain?: string
  amount?: string
  schedule?: string
  frequency?: string
  recipient?: string
  to_address?: string
  configuration?: Record<string, unknown>
  config_json?: string
  ui?: {
    actions?: ToolAction[]
  }
}

type Props = {
  data: unknown
}

const isPolicyPreviewData = (data: unknown): data is PolicyPreviewData => {
  if (typeof data !== 'object' || data === null) return false
  return true
}

const extractChainLabel = (
  obj: Record<string, unknown> | null
): string | undefined => {
  if (!obj) return undefined
  const chain = typeof obj.chain === 'string' ? obj.chain : undefined
  if (!chain) return undefined
  const token = typeof obj.token === 'string' ? obj.token : ''
  if (!token) return chain
  if (token.length > 10) {
    return `${token.slice(0, 6)}...${token.slice(-4)}`
  }
  return token
}

const getPluginDisplayName = (
  pluginType?: string,
  pluginName?: string
): string => {
  if (pluginName) return pluginName
  const type = pluginType?.toLowerCase() || ''
  if (type.includes('dca')) return 'Recurring Swaps (DCA)'
  if (type.includes('swap')) return 'Recurring Swaps'
  if (type.includes('send')) return 'Recurring Sends'
  if (type.includes('fee')) return 'Fee Management'
  return pluginType || 'Policy'
}

export const PolicyPreviewResult: FC<Props> = ({ data }) => {
  if (!isPolicyPreviewData(data)) {
    return null
  }

  const pluginName = data.pluginName || data.plugin_name
  const pluginType = data.pluginType
  const configuration = toRecord(data.configuration) || {}
  const configFrom = toRecord(configuration.from)
  const configTo = toRecord(configuration.to)

  const fromAsset =
    data.fromAsset || data.from_asset || extractChainLabel(configFrom)
  const fromChain =
    data.fromChain ||
    data.from_chain ||
    (typeof configFrom?.chain === 'string' ? configFrom.chain : undefined)
  const toAsset = data.toAsset || data.to_asset || extractChainLabel(configTo)
  const toChain =
    data.toChain ||
    data.to_chain ||
    (typeof configTo?.chain === 'string' ? configTo.chain : undefined)
  const recipient = data.recipient || data.to_address
  const configJson =
    typeof data.config_json === 'string'
      ? data.config_json
      : JSON.stringify(configuration, null, 2)
  const ui = toRecord(data.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  return (
    <Container>
      <VStack gap={16}>
        <Header>
          <Text size={14} weight={600} color="regular">
            Policy Preview
          </Text>
        </Header>

        <VStack gap={12}>
          <InfoRow>
            <Text size={13} color="shy">
              Plugin
            </Text>
            <Text size={13} color="regular" weight={500}>
              {getPluginDisplayName(pluginType, pluginName)}
            </Text>
          </InfoRow>

          {fromAsset && (
            <InfoRow>
              <Text size={13} color="shy">
                From
              </Text>
              <Text size={13} color="regular">
                {fromAsset}
                {fromChain && ` (${fromChain})`}
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
                {toChain && ` (${toChain})`}
              </Text>
            </InfoRow>
          )}

          {recipient && (
            <InfoRow>
              <Text size={13} color="shy">
                Recipient
              </Text>
              <Text size={13} color="regular" family="mono">
                {recipient}
              </Text>
            </InfoRow>
          )}

          {(data.amount ||
            (typeof configuration.fromAmount === 'string' &&
              configuration.fromAmount)) && (
            <InfoRow>
              <Text size={13} color="shy">
                Amount
              </Text>
              <Text size={13} color="regular">
                {data.amount || (configuration.fromAmount as string)}
              </Text>
            </InfoRow>
          )}

          {(data.schedule ||
            data.frequency ||
            typeof configuration.frequency === 'string') && (
            <InfoRow>
              <Text size={13} color="shy">
                Frequency
              </Text>
              <Text size={13} color="regular">
                {data.schedule ||
                  data.frequency ||
                  (configuration.frequency as string)}
              </Text>
            </InfoRow>
          )}
        </VStack>

        <VStack style={{ padding: '0 16px' }}>
          <DetailsDrawer title="Configuration JSON">
            <ConfigCode>{configJson}</ConfigCode>
          </DetailsDrawer>
        </VStack>

        <Footer>
          <VStack gap={8}>
            <HStack gap={4} alignItems="center">
              <Text size={12} color="shy">
                Ready to submit with
              </Text>
              <Text size={12} color="supporting" family="mono">
                policy_add
              </Text>
            </HStack>
            <ActionBar actions={actions} />
          </VStack>
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

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
`

const Footer = styled.div`
  padding: 12px 16px;
  background: ${getColor('background')};
`

const ConfigCode = styled.pre`
  margin: 0;
  padding: 8px;
  border-radius: 6px;
  max-height: 180px;
  overflow: auto;
  font-size: 11px;
  background: ${getColor('foreground')};
  color: ${getColor('textSupporting')};
`
