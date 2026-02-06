import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'
import { ToolAction, toRecord } from '../types'

type PluginItem = {
  id: string
  name?: string
  title?: string
  description?: string
}

type PluginListData = {
  plugins?: PluginItem[]
  ui?: {
    actions?: ToolAction[]
  }
}

type Props = {
  data: unknown
}

const isPluginListData = (data: unknown): data is PluginListData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.plugins)) return false
  return obj.plugins.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      (typeof (item as PluginItem).name === 'string' ||
        typeof (item as PluginItem).title === 'string')
  )
}

const getPluginIcon = (name: string): string => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('swap') || nameLower.includes('dca')) return '🔄'
  if (nameLower.includes('send')) return '📤'
  if (nameLower.includes('fee')) return '💰'
  if (nameLower.includes('payroll')) return '💵'
  return '🔌'
}

export const PluginListResult: FC<Props> = ({ data }) => {
  if (!isPluginListData(data) || !data.plugins) {
    return null
  }

  const ui = toRecord(data.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  return (
    <ResultPanel title="Available Plugins" count={data.plugins.length}>
      {data.plugins.map((plugin, index) => (
        <ResultRow
          key={index}
          icon={
            <PluginIcon>
              {getPluginIcon(plugin.name || plugin.title || 'Plugin')}
            </PluginIcon>
          }
        >
          <VStack gap={2}>
            <Text size={14} weight={500} color="regular">
              {plugin.name || plugin.title || 'Plugin'}
            </Text>
            {plugin.description && (
              <Text size={12} color="shy">
                {plugin.description}
              </Text>
            )}
          </VStack>
        </ResultRow>
      ))}
      {actions.length > 0 && (
        <VStack style={{ padding: '12px 16px' }}>
          <ActionBar actions={actions} />
        </VStack>
      )}
    </ResultPanel>
  )
}

const PluginIcon = styled.span`
  font-size: 20px;
`
