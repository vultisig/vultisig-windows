import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import styled from 'styled-components'

export const AddressBookPageHeader = styled(PageHeader)`
  padding-inline: 0px;
  min-height: 59px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Wrapper = styled(VStack)`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.background.toCssValue()};
`
