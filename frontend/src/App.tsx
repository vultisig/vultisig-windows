import React from 'react';
import { RouterProvider } from 'react-router-dom';

import './i18n/config';
import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly';
import { QueryClientProvider } from '@tanstack/react-query';
import { darkTheme } from './lib/ui/theme/darkTheme';
import { ThemeProvider } from './lib/ui/theme/ThemeProvider';
import { GlobalStyle } from './lib/ui/css/GlobalStyle';
import { VaultsDependant } from './vault/components/VaultsDependant';

import { getQueryClient } from './query/queryClient';

import { ToastProvider } from './lib/ui/toast/ToastProvider';

import { router } from './router';

const queryClient = getQueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        <div className="w-full min-h-screen bg-primary h-full flex flex-col">
          <VaultsDependant>
            <InitializedWalletOnly>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </InitializedWalletOnly>
          </VaultsDependant>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
