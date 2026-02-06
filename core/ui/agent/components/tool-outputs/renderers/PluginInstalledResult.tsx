import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { ActionBar } from '../ActionBar'
import { ResultPanel } from '../ResultPanel'
import { readBoolean, readString, ToolAction, toRecord } from '../types'

type Props = {
  data: unknown
}

export const PluginInstalledResult: FC<Props> = ({ data }) => {
  const obj = toRecord(data)
  if (!obj) return null

  const pluginName = readString(obj, 'plugin_name', 'pluginName', 'plugin_id')
  const installed = readBoolean(obj, 'installed')
  const message = readString(obj, 'message')
  const ui = toRecord(obj.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  if (!pluginName || installed === undefined) return null

  return (
    <ResultPanel title="Plugin Status">
      <VStack gap={8} style={{ padding: 12 }}>
        <HStack gap={8} alignItems="center">
          <Text size={14} weight={600} color="regular">
            {pluginName}
          </Text>
          <Text size={12} color={installed ? 'success' : 'warning'}>
            {installed ? 'Installed' : 'Not Installed'}
          </Text>
        </HStack>
        {message && (
          <Text size={12} color="shy">
            {message}
          </Text>
        )}
        <ActionBar actions={actions} />
      </VStack>
    </ResultPanel>
  )
}
