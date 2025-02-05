import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly';
import { I18nProvider } from './i18n/I18nProvider';
import { GlobalStyle } from './lib/ui/css/GlobalStyle';
import { VStack } from './lib/ui/layout/Stack';
import { darkTheme } from './lib/ui/theme/darkTheme';
import { ThemeProvider } from './lib/ui/theme/ThemeProvider';
import { ToastProvider } from './lib/ui/toast/ToastProvider';
import OnboardingResetter from './onboarding/OnboardingRessetterProvider';
import { WalletCoreProvider } from './providers/WalletCoreProvider';
import { getQueryClient } from './query/queryClient';
import { router } from './router';
import { RemoteStateDependant } from './state/RemoteStateDependant';

const queryClient = getQueryClient();

const App = () => {
  return (
    <WalletCoreProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <I18nProvider>
            <GlobalStyle />
            <VStack fullSize>
              <RemoteStateDependant>
                <InitializedWalletOnly>
                  <OnboardingResetter>
                    <ToastProvider>
                      <RouterProvider router={router} />
                    </ToastProvider>
                  </OnboardingResetter>
                </InitializedWalletOnly>
              </RemoteStateDependant>
            </VStack>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WalletCoreProvider>
  );
};

export default App;
