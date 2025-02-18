import { Stack } from 'expo-router'

import { AuthRedirectProvider } from '../providers/AuthRedirectProvider'
import { I18nProvider } from '../providers/I18nProvider'
import { ReactQueryProvider } from '../providers/ReactQueryProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import { darkTheme } from '../ui/theme/darkTheme'

const Layout = () => (
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

export default Layout
