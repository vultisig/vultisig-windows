import React, { ComponentProps, Fragment, ReactNode } from 'react'

import { Stack } from './Stack'

type StackSeparatedByProps = ComponentProps<typeof Stack> & {
  separator: ReactNode
}

export const StackSeparatedBy = ({
  children,
  separator,
  ...rest
}: StackSeparatedByProps) => {
  const items = React.Children.toArray(children)
  return (
    <Stack {...rest}>
      {items.map((child, index) => {
        if (items.length - 1 === index) {
          return child
        }

        return (
          <Fragment key={index}>
            {child}
            {separator}
          </Fragment>
        )
      })}
    </Stack>
  )
}
