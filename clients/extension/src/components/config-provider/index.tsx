import { ConfigProvider, theme } from 'antd'
import { FC, ReactNode } from 'react'

const Component: FC<{ children: ReactNode }> = ({ children }) => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        borderRadius: 12,
        colorPrimary: '#33e6bf',
        colorTextLightSolid: '#02122b',
        fontFamily: 'inherit',
      },
    }}
  >
    {children}
  </ConfigProvider>
)

export default Component
