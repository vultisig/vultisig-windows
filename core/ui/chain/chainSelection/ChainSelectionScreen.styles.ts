import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const FullScreenContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${getColor('background')};
  z-index: 2;
`

export const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`

export const ChainList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  background-color: #061b3a;
  border-radius: 12px;
`

export const ChainItem = styled(HStack)`
  cursor: pointer;
  height: 60px;
  min-height: 58px;
  padding: 12px 20px;
  gap: 16px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #11284a;
  transition: background-color 0.2s;
  background-color: #061b3a;
  justify-content: space-between;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`

export const ChainContent = styled(HStack)`
  gap: 16px;
  align-items: center;
`
