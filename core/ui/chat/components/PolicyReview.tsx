import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { PolicyReady } from '../state/chatTypes'

type PolicyReviewProps = {
  policyReady: PolicyReady
  onCreate: () => void
  onCancel: () => void
}

export const PolicyReview = ({
  policyReady,
  onCreate,
  onCancel,
}: PolicyReviewProps) => {
  const config = policyReady.configuration

  return (
    <Container gap={12}>
      <VStack gap={4}>
        <Text size={14} weight={500} color="contrast">
          Confirm Policy
        </Text>
        <Text size={12} color="shy">
          Review the policy configuration below
        </Text>
      </VStack>

      <ConfigSection gap={8}>
        {Object.entries(config).map(([key, value]) => (
          <ConfigRow key={key}>
            <Text size={12} color="shy">
              {formatLabel(key)}
            </Text>
            <Text size={12} color="contrast" weight={500}>
              {formatValue(value)}
            </Text>
          </ConfigRow>
        ))}
      </ConfigSection>

      <VStack gap={8}>
        <Button onClick={onCreate}>Create Policy</Button>
        <Button kind="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </VStack>
    </Container>
  )
}

const Container = styled(VStack)`
  padding: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const ConfigSection = styled(VStack)`
  padding: 12px;
  background: ${getColor('background')};
  border-radius: 8px;
`

const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
