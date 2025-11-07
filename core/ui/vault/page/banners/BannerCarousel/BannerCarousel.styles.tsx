import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import styled from 'styled-components'

export const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
`

export const CarouselTrack = styled.div`
  width: 100%;
`

export const NavigationButton = styled(UnstyledButton)<{
  $position: 'left' | 'right'
}>`
  position: absolute;
  top: 50%;
  ${({ $position }) => ($position === 'left' ? 'left: 8px;' : 'right: 8px;')}
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  font-size: 20px;
  color: white;
  z-index: 10;
  transition:
    transform 0.2s,
    background 0.2s;

  &:hover {
    transform: translateY(-50%) scale(1.1);
    background: rgba(255, 255, 255, 0.25);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`

export const PaginationContainer = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
`

export const PaginationDot = styled.button<{ $isActive: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: ${({ $isActive }) =>
    $isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  padding: 0;
  transition:
    background 0.2s,
    transform 0.2s;

  &:hover {
    background: ${({ $isActive }) =>
      $isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)'};
    transform: scale(1.2);
  }
`
