import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import styled from 'styled-components'

export const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(59deg, #061b3a 27.59%, #2155df 96.16%);
  overflow: hidden;
`

export const BackgroundPattern = styled.div`
  position: absolute;
  right: -10px;
  top: -10px;
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
  gap: 4px;
`

export const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FollowButton = styled(UnstyledButton)`
  padding: 10px 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4ade80 0%, #22d3ee 100%);
  color: #0f172a;
  font-size: 14px;
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

export const CloseButton = styled(IconButton)`
  display: flex;
  width: 40px;
  height: 40px;
  padding: 12px;
  justify-content: center;
  align-items: center;
  border-radius: 77px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);

  position: absolute;
  right: 6px;
  top: 6px;
`
