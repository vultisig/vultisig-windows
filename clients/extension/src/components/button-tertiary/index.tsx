import {
  backgroundTertiary,
  buttonSecondaryHover,
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
          colorPrimary: backgroundTertiary,
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
