import { ConfigProvider, theme } from 'antd'
import { FC, ReactNode } from 'react'

// TODO: Deprecate Ant Design and start using styled-components instead to be consistent with the desktop client. All the base components should be in @lib/ui. If you need a new compnent, first check in the desktop client if it's not already created, move it to the @lib/ui and reuse it.
export const AntDesignThemeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => (
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
