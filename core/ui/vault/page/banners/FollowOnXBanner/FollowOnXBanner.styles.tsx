import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import styled from 'styled-components'

export const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 20px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a3a6e 0%, #2d5aa0 100%);
  overflow: hidden;
`

export const BackgroundPattern = styled.div`
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  height: 280px;
  opacity: 0.3;
  pointer-events: none;
`

export const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FollowButton = styled(UnstyledButton)`
  padding: 12px 32px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4ade80 0%, #22d3ee 100%);
  color: #0f172a;
  font-size: 16px;
  font-weight: 600;
  transition:
    transform 0.2s,
    opacity 0.2s;

  &:hover {
    transform: scale(1.02);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`

export const PaginationDot = styled.button<{ $isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${({ $isActive }) => ($isActive ? '#ffffff' : '#ffffff40')};
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? '#ffffff' : '#ffffff60')};
  }
`

export const CloseButton = styled(UnstyledButton)`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80 0%, #22d3ee 100%);
  display: grid;
  place-items: center;
  color: #0f172a;
  font-size: 18px;
  transition:
    transform 0.2s,
    opacity 0.2s;
  z-index: 2;

  &:hover {
    transform: scale(1.05);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.95);
  }
`
