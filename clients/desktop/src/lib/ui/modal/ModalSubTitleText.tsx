import { AsProp } from '@lib/ui/props'
import { ComponentProps } from 'react'

import { Text } from '../text'

export const ModalSubTitleText = (
  props: ComponentProps<typeof Text> & AsProp
) => <Text color="supporting" as="div" {...props} />
