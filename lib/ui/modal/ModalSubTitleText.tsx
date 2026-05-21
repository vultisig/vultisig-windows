import { AsProp } from '@lib/ui/props'
import { Text, TextProps } from '@lib/ui/text'
import { HTMLAttributes } from 'react'

type ModalSubTitleTextProps = TextProps &
  HTMLAttributes<HTMLDivElement> &
  AsProp

export const ModalSubTitleText = (props: ModalSubTitleTextProps) => (
  <Text color="supporting" as="div" {...props} />
)
