import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { getColor } from '@lib/ui/theme/getters'
import { motion } from 'framer-motion'
import styled from 'styled-components'

export const CarouselContainer = styled.div`
  isolation: isolate;
  position: relative;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

export const CarouselViewport = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
`

export const CarouselTrack = styled(motion.div)`
  display: flex;
  width: 100%;
`

export const CarouselSlide = styled.div`
  flex: 0 0 100%;
  min-width: 0;
`

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 4px;
`

export const PaginationDot = styled(UnstyledButton)<{ $isActive: boolean }>`
  width: ${({ $isActive }) => ($isActive ? 20 : 4)}px;
  height: 4px;
  border-radius: 99px;
  border: none;
  background: ${({ $isActive, theme }) =>
    $isActive
      ? theme.colors.textShyExtra.toCssValue()
      : getColor('foregroundExtra')({ theme })};
  cursor: pointer;
  padding: 0;
  transition:
    width 0.2s,
    background 0.2s,
    opacity 0.2s;

  &:hover {
    opacity: 0.82;
  }
`
