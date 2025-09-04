import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { PasscodeGuard } from '@core/ui/passcodeEncryption/guard/PasscodeGuard'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProvider'
import { CoreProvider, CoreState } from '@core/ui/state/core'
import { StorageDependant } from '@core/ui/storage/StorageDependant'
import { ActiveVaultOnly } from '@core/ui/vault/ActiveVaultOnly'
import { CoinFinder } from '@core/ui/vault/chain/coin/finder/CoinFinder'
import { CoinsMetadataManager } from '@core/ui/vault/chain/coin/metadata/CoinsMetadataManager'
import { Wrap } from '@lib/ui/base/Wrap'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import React from 'react'
import styled from 'styled-components'

type CoreAppProps = Partial<ChildrenProp> & {
  coreState: CoreState
  migrationsManager?: React.ComponentType<ChildrenProp>
}

const Container = styled.div`
  ${vStack({ fullSize: true, position: 'relative', scrollable: true })}
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
