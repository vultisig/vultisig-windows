import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { motion } from 'framer-motion'
import styled from 'styled-components'

export const ListItem = styled(motion.button)<{
  isEditModeOn: boolean
  isCurrentlyBeingDragged: boolean
}>`
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
  transform-origin: center;
  border: ${({ isCurrentlyBeingDragged, theme }) =>
    isCurrentlyBeingDragged
      ? `2px solid ${theme.colors.foregroundExtra.toCssValue()}`
      : 'none'};
  border-radius: ${({ isCurrentlyBeingDragged }) =>
    isCurrentlyBeingDragged && '8px'};

  display: grid;
  grid-template-columns: fit-content(200px) 1fr fit-content(200px);
  grid-template-rows: 1fr 1fr;
  column-gap: 8px;
`

const ItemText = styled(Text)`
  font-size: 14px;
`

export const ColumnOneBothRowsItem = styled(ItemText)`
  grid-column: 1;
  grid-row: 1 / span 2;
  align-self: center;
`

export const ColumnTwoRowOneItem = styled(ItemText)`
  grid-column: 2;
  grid-row: 1;
  text-align: start;
`

export const ColumnTwoRowTwoItem = styled(ItemText)`
  grid-column: 2;
  grid-row: 2;
  text-align: start;
`

export const ColumnThreeRowOneItem = styled(ItemText)`
  grid-column: 3;
  grid-row: 1;
`

export const ModifyButtonWrapper = styled(motion.div)`
  display: grid;
  place-items: center;
`

export const ItemWrapper = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`
