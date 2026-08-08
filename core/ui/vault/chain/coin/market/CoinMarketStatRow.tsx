import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

type CoinMarketStatRowProps = {
  label: ReactNode
  value: ReactNode
  subValue?: ReactNode
  onClick?: () => void
}

const rowStyles = css`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  })};
  width: 100%;
  padding: 12px 16px;
`

/**
 * One label/value line of a coin-detail section card, with an optional
 * secondary caption under the value (e.g. the ATH row's "% · date"). With
 * `onClick` the entire row becomes the interactive target.
 */
export const CoinMarketStatRow = ({
  label,
  value,
  subValue,
  onClick,
}: CoinMarketStatRowProps) => {
  const content = (
    <>
      <Text size={13} weight={500} color="shy">
        {label}
      </Text>
      <VStack alignItems="flex-end" gap={2}>
        <Text
          size={13}
          weight={500}
          color="contrast"
          centerVertically={{ gap: 6 }}
        >
          {value}
        </Text>
        {subValue ? (
          <Text size={12} weight={500} color="shy">
            {subValue}
          </Text>
        ) : null}
      </VStack>
    </>
  )

  return onClick ? (
    <RowButton onClick={onClick}>{content}</RowButton>
  ) : (
    <Row>{content}</Row>
  )
}

const Row = styled.div`
  ${rowStyles};
`

const RowButton = styled(UnstyledButton)`
  ${rowStyles};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${getColor('foreground')};
  }
`
