import {
  buttonPrimary,
  buttonPrimaryHover,
} from '@clients/extension/src/colors'
import { Button, ButtonProps, ConfigProvider } from 'antd'
import { FC } from 'react'

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
          colorPrimary: buttonPrimary,
          colorPrimaryActive: buttonPrimaryHover,
          colorPrimaryHover: buttonPrimaryHover,
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
