import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { getCircleAccountQueryKey } from '@core/ui/defi/protocols/circle/queries/circleAccount'
import { CoreProvider, CoreState } from '@core/ui/state/core'
import { CurrentVaultIdProvider } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { VaultsProvider } from '@core/ui/storage/vaults'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { queryClientDefaultOptions } from '@lib/ui/query/queryClientDefaultOptions'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { CoinKey, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

type QaVault = Vault & { coins: AccountCoin[] }

type CreateQaVaultInput = {
  name: string
  coins: AccountCoin[]
}

type SeedStoredSettingsInput = {
  fiatCurrency?: FiatCurrency
  language?: string
  isBalanceVisible?: boolean
}

type SeedCircleAccountInput = {
  ownerAddress: string
  accountAddress: string
  accountId?: string
}

type SeedCoinBalanceInput = {
  coin: AccountCoin
  balance: bigint
}

type SeedCoinPrice = {
  coin: CoinKey & { priceProviderId?: string }
  price: number
}

type SeedCoinPricesInput = {
  fiatCurrency?: FiatCurrency
  prices: SeedCoinPrice[]
}

type DefiQaProvidersProps = ChildrenProp & {
  queryClient: QueryClient
  vault: QaVault
}

const noop = async () => {}

export const qaOwnerAddress = '0x0000000000000000000000000000000000000001'
export const qaCircleAccountAddress =
  '0x0000000000000000000000000000000000000002'

export const qaEthCoin: AccountCoin = {
  chain: Chain.Ethereum,
  address: qaOwnerAddress,
  ticker: 'ETH',
  decimals: 18,
}

export const createQaVault = ({ name, coins }: CreateQaVaultInput): QaVault => ({
  name,
  publicKeys: {
    ecdsa:
      '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044',
    eddsa:
      'a60409ef95ab55eb22d69b7f7504415358fee3657e665052780dce532409ef56',
  },
  signers: ['qa-device'],
  createdAt: 1_700_000_000_000,
  hexChainCode:
    '0000000000000000000000000000000000000000000000000000000000000000',
  keyShares: {
    ecdsa: '',
    eddsa: '',
  },
  localPartyId: 'qa-device',
  libType: 'DKLS',
  order: 0,
  isBackedUp: true,
  coins,
})

export const createDefiQaQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        ...(queryClientDefaultOptions?.queries ?? {}),
        staleTime: Infinity,
      },
    },
  })

export const seedStoredSettings = (
  queryClient: QueryClient,
  {
    fiatCurrency = 'usd',
    language = 'en',
    isBalanceVisible = true,
  }: SeedStoredSettingsInput = {}
) => {
  queryClient.setQueryData([StorageKey.fiatCurrency], fiatCurrency)
  queryClient.setQueryData([StorageKey.language], language)
  queryClient.setQueryData([StorageKey.isBalanceVisible], isBalanceVisible)
}

export const seedCircleAccount = (
  queryClient: QueryClient,
  {
    ownerAddress,
    accountAddress,
    accountId = 'qa-circle-account',
  }: SeedCircleAccountInput
) => {
  queryClient.setQueryData(getCircleAccountQueryKey({ ownerAddress }), {
    id: accountId,
    address: accountAddress,
  })
}

export const seedCoinBalance = (
  queryClient: QueryClient,
  { coin, balance }: SeedCoinBalanceInput
) => {
  const coinKey = extractAccountCoinKey(coin)

  queryClient.setQueryData(getBalanceQueryKey(coinKey), {
    [accountCoinKeyToString(coinKey)]: balance,
  })
}

export const seedCoinPrices = (
  queryClient: QueryClient,
  { fiatCurrency = 'usd', prices }: SeedCoinPricesInput
) => {
  const coins = prices.map(({ coin: { chain, id, priceProviderId } }) => ({
    chain,
    id,
    priceProviderId,
  }))
  const data = Object.fromEntries(
    prices.map(({ coin, price }) => [coinKeyToString(coin), price])
  )

  queryClient.setQueryData(
    getCoinPricesQueryKeys({
      coins,
      fiatCurrency,
    }),
    data
  )
}

const createQaCoreState = (vault: QaVault): CoreState => {
  const vaultId = getVaultId(vault)

  return {
    client: 'desktop',
    openUrl: () => {},
    saveFile: noop,
    mpcDevice: 'windows',
    vaultCreationMpcLib: 'DKLS',
    getClipboardText: async () => '',
    version: 'qa',
    isLocalModeAvailable: true,
    getMpcServerUrl: async () => '',
    goBack: () => {},
    popNavigationHistory: () => {},
    goHome: () => {},
    getVaults: async () => [vault],
    createVault: async input => input,
    updateVault: async () => vault,
    deleteVault: noop,
    updateVaultsKeyShares: noop,
    getCoins: async () => ({ [vaultId]: vault.coins }),
    createCoins: noop,
    createCoin: noop,
    deleteCoin: noop,
    getCurrentVaultId: async () => vaultId,
    setCurrentVaultId: noop,
    getFiatCurrency: async () => 'usd',
    setFiatCurrency: noop,
    getLanguage: async () => 'en',
    setLanguage: noop,
    getIsBalanceVisible: async () => true,
    setIsBalanceVisible: noop,
    getIsBlockaidEnabled: async () => false,
    setIsBlockaidEnabled: noop,
    getHasFinishedOnboarding: async () => true,
    setHasFinishedOnboarding: noop,
    getHasSeenNotificationPrompt: async () => true,
    setHasSeenNotificationPrompt: noop,
    getHasFinishedReferralsOnboarding: async () => true,
    setHasFinishedReferralsOnboarding: noop,
    getCoinFinderIgnore: async () => [],
    addToCoinFinderIgnore: noop,
    removeFromCoinFinderIgnore: noop,
    getVaultFolders: async () => [],
    createVaultFolder: noop,
    updateVaultFolder: noop,
    deleteVaultFolder: noop,
    getAddressBookItems: async () => [],
    createAddressBookItem: noop,
    updateAddressBookItem: noop,
    deleteAddressBookItem: noop,
    getPasscodeEncryption: async () => null,
    setPasscodeEncryption: noop,
    getPasscodeAutoLock: async () => null,
    setPasscodeAutoLock: noop,
    canPersistPasscodeUnlockSession: false,
    getPasscodeUnlockSession: async () => null,
    setPasscodeUnlockSession: noop,
    clearPasscodeUnlockSession: noop,
    getFriendReferral: async () => null,
    setFriendReferral: noop,
    getDismissedBanners: async () => [],
    setDismissedBanners: noop,
    getIsCircleVisible: async () => true,
    setIsCircleVisible: noop,
    getIsMLDSAEnabled: async () => false,
    getIsTssBatchingEnabled: async () => false,
    setIsTssBatchingEnabled: noop,
    getTransactionRecords: async () => [],
    saveTransactionRecord: noop,
    updateTransactionRecord: noop,
    getDefiChains: async () => [],
    setDefiChains: noop,
    getDefiPositions: async () => ({}),
    setDefiPositions: noop,
  }
}

export const DefiQaProviders = ({
  queryClient,
  vault,
  children,
}: DefiQaProvidersProps) => {
  const vaultId = getVaultId(vault)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        <CoreProvider value={createQaCoreState(vault)}>
          <WalletCoreProvider>
            <VaultsProvider value={[vault]}>
              <CurrentVaultIdProvider value={vaultId}>
                <CurrentVaultProvider value={vault}>
                  <NavigationProvider
                    initialValue={{
                      history: [{ id: 'defi', state: { protocol: 'circle' } }],
                    }}
                  >
                    {children}
                  </NavigationProvider>
                </CurrentVaultProvider>
              </CurrentVaultIdProvider>
            </VaultsProvider>
          </WalletCoreProvider>
        </CoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
