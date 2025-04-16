import {
  alertSuccess,
  backgroundsSecondary,
  backgroundTertiary,
  borderLight,
  buttonDisabled,
} from '@clients/extension/src/colors'
import { hexToRgba, rem } from '@clients/extension/src/utils/functions'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

export const StyledActiveVaultIcon = styled.span`
  align-items: center;
  background-color: ${backgroundsSecondary};
  border: solid ${rem(1)} ${borderLight};
  border-radius: ${rem(20)};
  color: ${alertSuccess};
  display: flex;
  font-size: ${rem(13)};
  font-weight: 500;
  height: ${rem(34)};
  padding: 0 ${rem(12)};
`

export const StyledActiveVaultName = styled.span`
  font-size: ${rem(14)};
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const StyledActiveVault = styled.div`
  align-items: center;
  background-color: ${hexToRgba(buttonDisabled, 0.5)};
  border: solid ${rem(1)} ${borderLight};
  border-radius: ${rem(12)};
  display: flex;
  gap: ${rem(12)};
  padding: ${rem(16)} ${rem(20)};
  position: relative;
`

export const StyledDevices = styled(Text)`
  align-items: center;
  border: solid ${rem(1)} ${borderLight};
  border-radius: ${rem(16)};
  display: flex;
  height: ${rem(32)};
  padding: 0 ${rem(12)};
`

export const StyledList = styled(VStack)`
  background-color: ${borderLight};
  border-radius: ${rem(12)};
  overflow: hidden;
`

export const StyledListItem = styled(HStack)`
  background-color: ${backgroundsSecondary};
  cursor: pointer;
  height: ${rem(64)};
  padding: 0 ${rem(20)};

  &:hover {
    background-color: ${backgroundTertiary};
  }
`
