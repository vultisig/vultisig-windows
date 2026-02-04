import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import type { Preview } from '@storybook/react-vite'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from 'styled-components'

import i18n from '../i18n/config'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={darkTheme}>
          <GlobalStyle />
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: darkTheme.colors.background.toCssValue(),
            }}
          >
            <Story />
          </div>
        </ThemeProvider>
      </I18nextProvider>
    ),
  ],
}

export default preview
