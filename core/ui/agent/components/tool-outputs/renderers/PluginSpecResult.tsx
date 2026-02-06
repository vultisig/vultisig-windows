import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { DetailsDrawer } from '../DetailsDrawer'
import { ResultPanel } from '../ResultPanel'
import { readString, ToolAction, toRecord } from '../types'

type Props = {
  data: unknown
}

export const PluginSpecResult: FC<Props> = ({ data }) => {
  const obj = toRecord(data)
  if (!obj) return null

  const pluginName = readString(obj, 'plugin_name', 'pluginName')
  const description = readString(obj, 'description')
  const requiredFields = obj.required_fields
  const supportedChains = obj.supported_chains
  const supportedAssets = obj.supported_assets
  const configurationExample = obj.configuration_example
  const configurationSchema = obj.configuration_schema
  const ui = toRecord(obj.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  if (!pluginName && !description) return null

  return (
    <ResultPanel title="Plugin Details">
      <VStack gap={8} style={{ padding: 12 }}>
        {pluginName && (
          <Text size={14} weight={600} color="regular">
            {pluginName}
          </Text>
        )}
        {description && (
          <Text size={12} color="shy">
            {description}
          </Text>
        )}
        <DetailsDrawer title="Technical Details">
          <VStack gap={8}>
            <Section>
              <Label>Required fields</Label>
              <Value>
                {Array.isArray(requiredFields)
                  ? requiredFields.join(', ')
                  : 'Not specified'}
              </Value>
            </Section>
            <Section>
              <Label>Supported chains</Label>
              <Value>
                {Array.isArray(supportedChains)
                  ? supportedChains.join(', ')
                  : 'Not specified'}
              </Value>
            </Section>
            <Section>
              <Label>Supported assets</Label>
              <Value>
                {Array.isArray(supportedAssets)
                  ? supportedAssets.join(', ')
                  : 'Not specified'}
              </Value>
            </Section>
            <Section>
              <Label>Configuration example</Label>
              <CodeBlock>
                {JSON.stringify(configurationExample ?? {}, null, 2)}
              </CodeBlock>
            </Section>
            <Section>
              <Label>Configuration schema</Label>
              <CodeBlock>
                {JSON.stringify(configurationSchema ?? {}, null, 2)}
              </CodeBlock>
            </Section>
          </VStack>
        </DetailsDrawer>
        <ActionBar actions={actions} />
      </VStack>
    </ResultPanel>
  )
}

const Section = styled(VStack)`
  gap: 4px;
`

const Label = styled(Text).attrs({
  size: 11,
  color: 'supporting',
  weight: 600,
})``

const Value = styled(Text).attrs({
  size: 12,
  color: 'shy',
})``

const CodeBlock = styled.pre`
  margin: 0;
  padding: 8px;
  border-radius: 6px;
  max-height: 180px;
  overflow: auto;
  font-size: 11px;
  background: ${getColor('foreground')};
  color: ${getColor('textSupporting')};
`
