import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

import { ReviewCard } from './ReviewCard'
import { ReviewConnector } from './ReviewConnector'

const Container = styled(VStack)`
  position: relative;
  gap: 8px;
`

const Card = styled(ReviewCard)`
  gap: 4px;
  min-height: 82px;
`

const Address = styled(Text)`
  overflow-wrap: anywhere;
  width: 100%;
`

type ReviewAddressCardProps = {
  name?: string
  address: string
  /** Colour of the address when no name sits above it. */
  emphasis: 'shyExtra' | 'shy'
}

const ReviewAddressCard = ({
  name,
  address,
  emphasis,
}: ReviewAddressCardProps) => (
  <Card>
    {name !== undefined && (
      <Text as="span" variant="stationBodyS" color="regular" centerHorizontally>
        {name}
      </Text>
    )}
    <Address
      as="span"
      variant="stationBodyS"
      color={name === undefined ? emphasis : 'shy'}
      centerHorizontally
    >
      {address}
    </Address>
  </Card>
)

type ReviewAddressCardsProps = {
  senderName: string
  senderAddress: string
  receiverName?: string
  receiverAddress: string
}

/**
 * Sender over receiver, joined by a chevron. Addresses are shown whole and
 * wrap instead of truncating: this is the last checkpoint before signing, and
 * a truncated address hides exactly the characters an address-poisoning
 * lookalike differs in.
 */
export const ReviewAddressCards = ({
  senderName,
  senderAddress,
  receiverName,
  receiverAddress,
}: ReviewAddressCardsProps) => (
  <Container>
    <ReviewAddressCard
      name={senderName}
      address={senderAddress}
      emphasis="shy"
    />
    <ReviewConnector>
      <ChevronDownIcon />
    </ReviewConnector>
    <ReviewAddressCard
      name={receiverName}
      address={receiverAddress}
      emphasis="shyExtra"
    />
  </Container>
)
