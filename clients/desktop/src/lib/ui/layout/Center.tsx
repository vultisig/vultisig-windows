import { ChildrenProp } from '@lib/ui/props'
import { ComponentProps } from 'react'

import { VStack } from './Stack'

export const Center = ({
  children,
  ...rest
}: ChildrenProp & ComponentProps<typeof VStack>) => (
  <VStack
    fullWidth
    fullHeight
    alignItems="center"
    justifyContent="center"
    {...rest}
  >
    {children}
  </VStack>
)
