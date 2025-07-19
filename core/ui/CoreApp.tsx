import { Wrap } from '@lib/ui/base/Wrap'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import {
  queryClientDefaultOptions,
  queryClientGcTime,
} from '@lib/ui/query/queryClientDefaultOptions'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import {
  defaultShouldDehydrateQuery,
  OmitKeyof,
  QueryClient,
} from '@tanstack/react-query'
import {
  Persister,
  PersistQueryClientOptions,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { WalletCoreProvider } from './chain/providers/WalletCoreProvider'
import { PasscodeGuard } from './passcodeEncryption/guard/PasscodeGuard'
import { ResponsivenessProvider } from './providers/ResponsivenessProivder'
import { CoreProvider, CoreState } from './state/core'
import { StorageDependant } from './storage/StorageDependant'
import { ActiveVaultOnly } from './vault/ActiveVaultOnly'
import { CoinFinder } from './vault/chain/coin/finder/CoinFinder'
import { CoinsMetadataManager } from './vault/chain/coin/metadata/CoinsMetadataManager'

type CoreAppProps = Partial<ChildrenProp> & {
  coreState: CoreState
  queriesPersister: Persister
  migrationsManager?: React.ComponentType<ChildrenProp>
}

const Container = styled.div`
  ${vStack({ fullSize: true, scrollable: true })}
  isolation: isolate;
`

export const CoreApp = ({
  children,
  coreState,
  queriesPersister,
  migrationsManager: MigrationsManager,
}: CoreAppProps) => {
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: queryClientDefaultOptions,
    })
  }, [])

  const persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'> =
    useMemo(() => {
      return {
        persister: queriesPersister,
        maxAge: queryClientGcTime,
        dehydrateOptions: {
          shouldDehydrateQuery: query => {
            if (query.meta?.disablePersist) {
              return false
            }

            return defaultShouldDehydrateQuery(query)
          },
        },
        buster: 'v2',
      }
    }, [queriesPersister])

  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <CoreProvider value={coreState}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <WalletCoreProvider>
            <Wrap wrap={MigrationsManager}>
              <StorageDependant>
                <ToastProvider>
                  <ResponsivenessProvider>
                    <Container>
                      {children}
                      <ActiveVaultOnly>
                        <CoinFinder />
                        <CoinsMetadataManager />
                      </ActiveVaultOnly>
                    </Container>
                    <PasscodeGuard />
                  </ResponsivenessProvider>
                </ToastProvider>
              </StorageDependant>
            </Wrap>
          </WalletCoreProvider>
        </PersistQueryClientProvider>
      </CoreProvider>
    </ThemeProvider>
  )
}
