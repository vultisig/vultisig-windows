import { Stack } from 'expo-router'

import { AuthRedirectProvider } from '../providers/AuthRedirectProvider'
import { ReactQueryProvider } from '../providers/ReactQueryProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import { darkTheme } from '../ui/theme/darkTheme'

const Layout = () => (
  <ReactQueryProvider>
    <ThemeProvider theme={darkTheme}>
      <AuthRedirectProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthRedirectProvider>
    </ThemeProvider>
  </ReactQueryProvider>
)

export default Layout
