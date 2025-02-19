import { PropsWithChildren } from 'react'
import { DefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/native'

type ThemeProviderProps = PropsWithChildren & {
  theme: DefaultTheme
}

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      {children}
    </StyledComponentsThemeProvider>
  )
}
