import { Button } from '@clients/extension/src/components/button'
import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate/index'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { Chain } from '@core/chain/Chain'
import { getDerivedPubKey } from '@core/mpc/derivePublicKey'
import { deriveAddress } from '@clients/desktop/src/chain/utils/deriveAddress'
import { VaultSigners } from '@core/ui/vault/signers'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Settings } from '@lib/ui/icons/Settings'
import { World } from '@lib/ui/icons/World'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { useTheme } from 'styled-components'
import { useCallback, useMemo } from 'react'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'

const ConnectedAppStatus = styled.span<{ connected: boolean }>`
  background-color: ${({ connected }) =>
    getColor(connected ? 'alertSuccess' : 'alertInfo')};
  border: solid 4px ${getColor('buttonBackgroundDisabled')};
  border-radius: 50%;
  height: 16px;
  position: absolute;
  right: -4px;
  top: -2px;
  width: 16px;
`

const ConnectedApp = styled.div`
  align-items: center;
  background-color: ${getColor('buttonBackgroundDisabled')};
  border: solid 1px ${getColor('borderLight')};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  position: relative;
  width: 36px;
`

const SUPPORTED_CHAINS = [
  {
    chain: Chain.Ethereum,
    path: "m/44'/60'/0'/0/0"
  },
  {
    chain: Chain.Bitcoin,
    path: "m/84'/0'/0'/0/0"
  },
  {
    chain: Chain.Cosmos,
    path: "m/44'/118'/0'/0/0"
  }
]

export const MainPage = () => {
  const vault = useCurrentVault()
  const { colors } = useTheme()
  const navigate = useAppNavigate()
  const walletCore = useWalletCore()

  const derivedAddresses = useMemo(() => {
    console.log("derivedAddresses")
    console.log("vault value:", vault)
    console.log("walletCore value:", walletCore)
    console.log("SUPPORTED_CHAINS value:", SUPPORTED_CHAINS)
    
    if (!vault || !walletCore) return []
    
    return SUPPORTED_CHAINS.map(({ chain, path }) => {
      try {
        const derivedPubKey = getDerivedPubKey(
          vault.publicKeys.ecdsa,
          vault.hexChainCode,
          path
        )
        // Convert the hex string to a PublicKey object
        const publicKeyData = walletCore.HexCoding.decode(derivedPubKey)
        const publicKey = walletCore.PublicKey.createWithData(publicKeyData, walletCore.PublicKeyType.secp256k1)
        
        const address = deriveAddress({
          chain,
          publicKey,
          walletCore: walletCore!,
        })
        return { chain, address }
      } catch (error) {
        console.error(`Failed to derive address for ${chain}:`, error)
        return { chain, address: undefined }
      }
    })
  }, [vault, walletCore])

  console.log("MainPage rendering")
  console.log("vault value:", vault)

  return vault ? (
    <VStack alignItems="center" justifyContent="center" fullHeight>
      <PageHeader
        primaryControls={
          <ConnectedApp>
            <World
              height={20}
              stroke={colors.textExtraLight.toHex()}
              width={20}
            />
            <ConnectedAppStatus connected />
          </ConnectedApp>
        }
        secondaryControls={
          <HStack gap={8} alignItems="center">
            <Button shape="round" size="small">
              Open Desktop
            </Button>
            <Button ghost>
              <Settings
                height={24}
                onClick={() => navigate('settings')}
                width={24}
              />
            </Button>
          </HStack>
        }
        hasBorder
      />
      <PageContent gap={24} fullWidth scrollable>
        <List>
          <ListItem
            extra={<VaultSigners vault={vault} />}
            title={vault.name}
            onClick={() => navigate('vaults')}
            hoverable
          />
        </List>
        <VStack gap={12}>
          <Text weight={500} size={12} color="light">
            Portfolio Overview
          </Text>
          {/* Address list for chains */}
          <List>
            {derivedAddresses.map(({ address, chain }) => (
              <ListItem
                key={`${chain}-${address}`}
                title={chain}
                description={
                  address ? (
                    <MiddleTruncate text={address} width={80} />
                  ) : undefined
                }
                extra={
                  <VStack gap={4} alignItems="end">
                    <ChainEntityIcon
                      value={getChainEntityIconSrc(chain)}
                      style={{ fontSize: 24 }}
                    />
                  </VStack>
                }
                hoverable
              />
            ))}
          </List>
        </VStack>
      </PageContent>
    </VStack>
  ) : (
    <></>
  )
}
