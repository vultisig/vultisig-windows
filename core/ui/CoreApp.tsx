import { Wrap } from '@lib/ui/base/Wrap'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import React from 'react'
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
  migrationsManager?: React.ComponentType<ChildrenProp>
}

const Container = styled.div`
  ${vStack({ fullSize: true, scrollable: true })}
  isolation: isolate;
`

export const CoreApp = ({
  children,
  coreState,
  migrationsManager: MigrationsManager,
}: CoreAppProps) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <CoreProvider value={coreState}>
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
      </CoreProvider>
    </ThemeProvider>
  )
}
