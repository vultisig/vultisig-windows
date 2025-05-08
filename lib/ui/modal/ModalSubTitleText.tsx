import { AsProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ComponentProps } from 'react'

export const ModalSubTitleText = (
  props: ComponentProps<typeof Text> & AsProp
) => <Text color="supporting" as="div" {...props} />
