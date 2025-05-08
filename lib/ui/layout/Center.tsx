import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { ComponentProps } from 'react'

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
