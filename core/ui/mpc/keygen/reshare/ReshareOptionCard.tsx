import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { ReshareChevronRightIcon } from './ReshareChevronRightIcon'

type ReshareOptionCardProps = {
  title: string
  description: string
  onClick: () => void
}

const Card = styled.button`
  align-items: center;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 20px;
  text-align: left;
  transition: background 0.2s;
  width: 100%;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

export const ReshareOptionCard = ({
  title,
  description,
  onClick,
}: ReshareOptionCardProps) => (
  <Card type="button" onClick={onClick}>
    <VStack gap={6}>
      <Text color="regular" size={17} weight={500}>
        {title}
      </Text>
      <Text color="shyExtra" size={13} weight={500}>
        {description}
      </Text>
    </VStack>
    <IconWrapper color="textShyExtra" size={18}>
      <ReshareChevronRightIcon />
    </IconWrapper>
  </Card>
)
