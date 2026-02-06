import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { ActionBar } from '../ActionBar'
import { ResultPanel } from '../ResultPanel'
import { readBoolean, readString, ToolAction, toRecord } from '../types'

type Props = {
  data: unknown
}

export const AssetLookupResult: FC<Props> = ({ data }) => {
  const obj = toRecord(data)
  if (!obj) return null

  const found = readBoolean(obj, 'found')
  const input = readString(obj, 'input')
  const chain = readString(obj, 'chain')
  const ticker = readString(obj, 'ticker')
  const message = readString(obj, 'message')
  const ui = toRecord(obj.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  if (found === undefined) return null

  return (
    <ResultPanel title="Asset Lookup">
      <VStack gap={8} style={{ padding: 12 }}>
        {found ? (
          <Text size={13} color="regular">
            {input || 'Asset'} resolves to {ticker || 'token'} on{' '}
            {chain || 'unknown chain'}.
          </Text>
        ) : (
          <Text size={13} color="warning">
            {message || `Asset ${input || ''} was not found.`}
          </Text>
        )}
        <ActionBar actions={actions} />
      </VStack>
    </ResultPanel>
  )
}
