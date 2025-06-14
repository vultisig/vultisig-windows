import type { Preview } from '@storybook/react-vite'
import { ThemeProvider } from 'styled-components'

import { GlobalStyle } from '../css/GlobalStyle'
import { darkTheme } from '../theme/darkTheme'

const preview: Preview = {
  decorators: [
    Story => (
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
