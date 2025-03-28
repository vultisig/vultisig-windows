import isPropValid from '@emotion/is-prop-valid'
import { ChildrenProp } from '@lib/ui/props'
import { StyleSheetManager } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { DefaultTheme } from 'styled-components'

const shouldForwardProp = (propName: string, target: any) => {
  if (typeof target === 'string') {
    return isPropValid(propName)
  }
  return true
}

type ThemeProviderProps = ChildrenProp & {
  theme: DefaultTheme
}

export const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <StyledComponentsThemeProvider theme={theme}>
        {children}
      </StyledComponentsThemeProvider>
    </StyleSheetManager>
  )
}
