import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { ActionBar } from '../ActionBar'
import { DetailsDrawer } from '../DetailsDrawer'
import { ResultPanel } from '../ResultPanel'
import { SuccessCard } from '../SuccessCard'
import { readBoolean, readString, ToolAction, toRecord } from '../types'

type Props = {
  data: unknown
}

export const PluginInstallResult: FC<Props> = ({ data }) => {
  const obj = toRecord(data)
  if (!obj) return null

  const success = readBoolean(obj, 'success')
  const pluginName = readString(obj, 'plugin_name', 'pluginName', 'plugin_id')
  const message = readString(obj, 'message')
  const alreadyInstalled = readBoolean(obj, 'already_installed')
  const errorText = readString(obj, 'error')
  const debugLog = Array.isArray(obj.debug_log)
    ? (obj.debug_log as string[])
    : []
  const ui = toRecord(obj.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  if (success === undefined || !pluginName) return null

  if (!success) {
    return (
      <ResultPanel title="Plugin Installation Failed">
        <VStack gap={8} style={{ padding: 12 }}>
          <HStack gap={8} alignItems="center">
            <Text size={14} weight={600} color="regular">
              {pluginName}
            </Text>
            <Text size={12} color="danger">
              Failed
            </Text>
          </HStack>
          {(errorText || message) && (
            <Text size={12} color="shy">
              {errorText || message}
            </Text>
          )}
          {debugLog.length > 0 && (
            <DetailsDrawer title="Debug Log">
              <VStack gap={2}>
                {debugLog.map((line, i) => (
                  <Text key={i} size={11} color="shy" family="mono">
                    {line}
                  </Text>
                ))}
              </VStack>
            </DetailsDrawer>
          )}
          <ActionBar actions={actions} />
        </VStack>
      </ResultPanel>
    )
  }

  const title = alreadyInstalled
    ? 'Plugin Already Installed'
    : 'Plugin Installed'

  return (
    <SuccessCard title={title}>
      <VStack gap={8}>
        <Text size={14} weight={500} color="regular">
          {pluginName}
        </Text>
        {message && (
          <Text size={12} color="shy">
            {message}
          </Text>
        )}
        {debugLog.length > 0 && (
          <DetailsDrawer title="Installation Log">
            <VStack gap={2}>
              {debugLog.map((line, i) => (
                <Text key={i} size={11} color="shy" family="mono">
                  {line}
                </Text>
              ))}
            </VStack>
          </DetailsDrawer>
        )}
        <ActionBar actions={actions} />
      </VStack>
    </SuccessCard>
  )
}
