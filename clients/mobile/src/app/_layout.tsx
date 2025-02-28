import { Stack } from 'expo-router'
import { ThemeProvider } from 'styled-components/native'

import { darkTheme } from '../lib/ui/theme'
import { AuthRedirectProvider } from '../providers/AuthRedirectProvider'
import { I18nProvider } from '../providers/I18nProvider'
import { ReactQueryProvider } from '../providers/ReactQueryProvider'

const Layout = () => {
  return (
    <ReactQueryProvider>
      <ThemeProvider theme={darkTheme}>
        <AuthRedirectProvider>
          <I18nProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </I18nProvider>
        </AuthRedirectProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}

export default Layout
