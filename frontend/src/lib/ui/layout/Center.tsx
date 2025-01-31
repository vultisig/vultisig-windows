import { ComponentProps } from 'react';

import { ChildrenProp } from '../props';
import { VStack } from './Stack';

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
);
