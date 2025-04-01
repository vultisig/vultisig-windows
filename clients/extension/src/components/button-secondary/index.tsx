import { FC } from 'react'
import { Button, ButtonProps, ConfigProvider } from 'antd'

import {
  buttonSecondary,
  buttonSecondaryHover,
} from '@clients/extension/src/colors'

const Component: FC<ButtonProps> = ({
  children,
  shape = 'round',
  type = 'primary',
  ...props
}) => (
  <ConfigProvider
    theme={{
      components: {
        Button: {
          colorPrimary: buttonSecondary,
          colorPrimaryActive: buttonSecondaryHover,
          colorPrimaryHover: buttonSecondaryHover,
        },
      },
    }}
  >
    <Button shape={shape} type={type} {...props}>
      {children}
    </Button>
  </ConfigProvider>
)

export default Component
