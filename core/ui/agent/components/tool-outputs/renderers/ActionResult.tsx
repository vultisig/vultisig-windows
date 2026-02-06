import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { ActionBar } from '../ActionBar'
import { SuccessCard } from '../SuccessCard'
import { readString, ToolAction, toRecord } from '../types'

type Props = {
  data: unknown
  title: string
}

export const ActionResult: FC<Props> = ({ data, title }) => {
  const obj = toRecord(data)
  if (!obj) return null

  const message = readString(obj, 'message')
  const ui = toRecord(obj.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  return (
    <SuccessCard title={title}>
      <VStack gap={8}>
        {message && (
          <Text size={13} color="shy">
            {message}
          </Text>
        )}
        <ActionBar actions={actions} />
      </VStack>
    </SuccessCard>
  )
}
