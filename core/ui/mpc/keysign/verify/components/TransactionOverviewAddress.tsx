import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const AddressRow = styled.div`
  align-items: flex-start;
  background-color: ${getColor('foreground')};
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 58px;
  padding: 12px 16px;
`

type TransactionOverviewAddressProps = {
  label: ReactNode
  address: string
  /**
   * Human-readable name for the address (vault name, address book entry, or
   * name-service label). Rendered above the address rather than beside it, so
   * it never competes with the address for horizontal space.
   */
  name?: string
}

/**
 * Renders an address on a keysign review screen in full, wrapping across lines
 * instead of middle-truncating. This is the last checkpoint before signing, so
 * the entire string has to be readable: a truncated address hides exactly the
 * characters an address-poisoning lookalike differs in.
 */
export const TransactionOverviewAddress = ({
  label,
  address,
  name,
}: TransactionOverviewAddressProps) => (
  <AddressRow>
    <Text as="span" color="shy" size={14} weight={500}>
      {label}
    </Text>
    <VStack gap={2} fullWidth>
      {name !== undefined && (
        <Text as="span" size={14} weight={500}>
          {name}
        </Text>
      )}
      <Text
        as="span"
        color={name === undefined ? 'regular' : 'shy'}
        family="mono"
        size={13}
        weight={500}
        style={{ overflowWrap: 'anywhere', width: '100%' }}
      >
        {address}
      </Text>
    </VStack>
  </AddressRow>
)
