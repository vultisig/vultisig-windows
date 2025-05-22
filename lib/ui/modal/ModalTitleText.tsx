import { ChildrenProp } from '@lib/ui/props'
import { Text, TextProps } from '@lib/ui/text'
import styled from 'styled-components'

import { ModalProps } from '.'

export const ModalTitleText = (
  props: TextProps & ChildrenProp & { align: ModalProps['titleAlign'] }
) => <Title color="contrast" as="div" weight="500" size={18} {...props} />

const Title = styled(Text)<{
  align: ModalProps['titleAlign']
}>`
  text-align: ${({ align }) => align ?? 'left'};
  width: 100%;
`
