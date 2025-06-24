import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import React from 'react'

type TxFeeRowProps = {
  label: string
  value?: React.ReactNode
  spinner?: boolean
  error?: boolean
}

export const TxFeeRow: React.FC<TxFeeRowProps> = ({
  value,
  spinner,
  error,
  label,
}) => {
  return (
    <HStack alignItems="center" gap={4} justifyContent="space-between">
      <Text color="shy" weight="500">
        {label}
      </Text>
      {spinner ? (
        <Spinner size="1em" />
      ) : error ? (
        <Text color="danger">--</Text>
      ) : (
        <Text>{value}</Text>
      )}
    </HStack>
  )
}
