import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { getCircleAccountQueryKey } from '@core/ui/defi/protocols/circle/queries/circleAccount'
import { CoreView } from '@core/ui/navigation/CoreView'
import { CoreProvider, CoreState } from '@core/ui/state/core'
import { CurrentVaultIdProvider } from '@core/ui/storage/currentVaultId'
import { SolanaMoveStakeDestinations } from '@core/ui/storage/solanaMoveStakeDestinations'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { VaultsProvider } from '@core/ui/storage/vaults'
import { getTronAccountResourcesQueryKey } from '@core/ui/vault/chain/tron/useTronAccountResourcesQuery'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { queryClientDefaultOptions } from '@lib/ui/query/queryClientDefaultOptions'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { TronAccountResources } from '@vultisig/core-chain/chains/tron/resources'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { CoinKey, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

type QaVault = Vault & { coins: AccountCoin[] }

type CreateQaVaultInput = {
  name: string
  coins: AccountCoin[]
}

type SeedStoredSettingsInput = {
  queryClient: QueryClient
  fiatCurrency?: FiatCurrency
  language?: string
  isBalanceVisible?: boolean
}

type SeedCircleAccountInput = {
  queryClient: QueryClient
  ownerAddress: string
  accountAddress: string
  accountId?: string
}

type SeedCoinBalanceInput = {
  queryClient: QueryClient
  coin: AccountCoin
  balance: bigint
}

type SeedCoinPrice = {
  coin: CoinKey & { priceProviderId?: string }
  price: number
}

type SeedCoinPricesInput = {
  queryClient: QueryClient
  fiatCurrency?: FiatCurrency
  prices: SeedCoinPrice[]
}

type SeedDefiPositionsInput = {
  queryClient: QueryClient
  /** Enabled position ids per chain, as `defiPositions` storage holds them. */
  positions: Record<string, string[]>
}

type SeedTronAccountResourcesInput = {
  queryClient: QueryClient
  address: string
  resources: TronAccountResources
}

type DefiQaProvidersProps = ChildrenProp & {
  queryClient: QueryClient
  vault: QaVault
  initialView?: CoreView
}

const noop = async () => {}

export const qaOwnerAddress = '0x0000000000000000000000000000000000000001'
export const qaCircleAccountAddress =
  '0x0000000000000000000000000000000000000002'
export const qaTronAddress = 'TQ1QaHarnessAddress11111111111111111'

export const qaEthCoin: AccountCoin = {
  chain: Chain.Ethereum,
  address: qaOwnerAddress,
  ticker: 'ETH',
  decimals: 18,
}

/** A fake but base58-shaped Solana address, for scenarios on that chain. */
export const qaSolanaOwnerAddress =
  'QAKamino1111111111111111111111111111111111111'

/**
 * The vault's native Solana coin. Present so `useCurrentVaultAddress` resolves
 * an address from storage rather than deriving one through WalletCore.
 */
export const qaSolanaCoin: AccountCoin = {
  ...chainFeeCoin[Chain.Solana],
  address: qaSolanaOwnerAddress,
}

export const qaTronCoin: AccountCoin = {
  chain: Chain.Tron,
  address: qaTronAddress,
  ticker: 'TRX',
  decimals: 6,
}

/**
 * Creates a deterministic fake vault with valid key shapes for DeFi UI QA.
 *
 * @param input - Vault name and account coins to expose through storage.
 * @returns A QA vault object compatible with core vault providers.
 */
export const createQaVault = ({
  name,
  coins,
}: CreateQaVaultInput): QaVault => ({
  name,
  publicKeys: {
    ecdsa: '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044',
    eddsa: 'a60409ef95ab55eb22d69b7f7504415358fee3657e665052780dce532409ef56',
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

/**
 * Creates a React Query client configured for deterministic harness fixtures.
 *
 * @returns A query client with app defaults and infinite stale time.
 */
export const createDefiQaQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        ...(queryClientDefaultOptions?.queries ?? {}),
        staleTime: Infinity,
      },
    },
  })

/**
 * Seeds storage-backed UI settings that DeFi screens expect to be loaded.
 *
 * @param input - Query client plus optional fiat currency, language, and balance visibility values.
 * @returns Nothing; values are written into the query cache.
 */
export const seedStoredSettings = ({
  queryClient,
  fiatCurrency = 'usd',
  language = 'en',
  isBalanceVisible = true,
}: SeedStoredSettingsInput) => {
  queryClient.setQueryData([StorageKey.fiatCurrency], fiatCurrency)
  queryClient.setQueryData([StorageKey.language], language)
  queryClient.setQueryData([StorageKey.isBalanceVisible], isBalanceVisible)
}

/**
 * Seeds the Circle protocol account lookup for a vault owner address.
 *
 * @param input - Query client, owner address, protocol account address, and optional account id.
 * @returns Nothing; the Circle account response is written into the query cache.
 */
export const seedCircleAccount = ({
  queryClient,
  ownerAddress,
  accountAddress,
  accountId = 'qa-circle-account',
}: SeedCircleAccountInput) => {
  queryClient.setQueryData(getCircleAccountQueryKey({ ownerAddress }), {
    id: accountId,
    address: accountAddress,
  })
}

/**
 * Seeds a coin balance using the same query key shape as production balance hooks.
 *
 * @param input - Query client, account coin, and chain-unit balance.
 * @returns Nothing; the balance record is written into the query cache.
 */
export const seedCoinBalance = ({
  queryClient,
  coin,
  balance,
}: SeedCoinBalanceInput) => {
  const coinKey = extractAccountCoinKey(coin)

  queryClient.setQueryData(getBalanceQueryKey(coinKey), {
    [accountCoinKeyToString(coinKey)]: balance,
  })
}

/**
 * Seeds fiat prices using the normalized query key shape used by production price hooks.
 *
 * @param input - Query client, optional fiat currency, and coin price records.
 * @returns Nothing; the price record is written into the query cache.
 */
export const seedCoinPrices = ({
  queryClient,
  fiatCurrency = 'usd',
  prices,
}: SeedCoinPricesInput) => {
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

/**
 * Seeds the set of DeFi positions the user has enabled, which the chain tabs
 * read before any network call — an unseeded record renders the opt-in banner
 * instead of the position list.
 */
export const seedDefiPositions = ({
  queryClient,
  positions,
}: SeedDefiPositionsInput) => {
  queryClient.setQueryData([StorageKey.defiPositions], positions)
}

/**
 * Seeds the TRON resource lookup with deterministic frozen and withdrawal data.
 *
 * @param input - Query client, TRON address, and resource response fixture.
 * @returns Nothing; the response is written into the query cache.
 */
export const seedTronAccountResources = ({
  queryClient,
  address,
  resources,
}: SeedTronAccountResourcesInput) => {
  queryClient.setQueryData(getTronAccountResourcesQueryKey(address), resources)
}

let qaSolanaMoveStakeDestinations: SolanaMoveStakeDestinations = {}

let qaIsLimitPriceChartExpanded = false

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
    replaceVault: async ({ vault: input }) => input,
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
    getIsLimitPriceChartExpanded: async () => qaIsLimitPriceChartExpanded,
    setIsLimitPriceChartExpanded: async isExpanded => {
      qaIsLimitPriceChartExpanded = isExpanded
    },
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
    getCustomRpcOverrides: async () => ({}),
    setCustomRpcOverrides: noop,
    // Stateful, unlike the other stubs: the move flow writes a destination on
    // one screen and reads it back on another, so a no-op setter would make the
    // harness unable to exercise prefill or cleanup.
    getSolanaMoveStakeDestinations: async () => qaSolanaMoveStakeDestinations,
    setSolanaMoveStakeDestinations: async destinations => {
      qaSolanaMoveStakeDestinations = destinations
    },
    getTransactionRecords: async () => [],
    saveTransactionRecord: noop,
    updateTransactionRecord: noop,
    getDefiChains: async () => [],
    setDefiChains: noop,
    getDefiPositions: async () => ({}),
    setDefiPositions: noop,
  }
}

/**
 * Wraps a DeFi screen with the providers needed to render against QA fixtures.
 *
 * @param props - Children, query client, and fake vault for the harness tree.
 * @returns The provider tree used by DeFi UI harness scenarios.
 */
export const DefiQaProviders = ({
  queryClient,
  vault,
  initialView = { id: 'defi', state: { protocol: 'circle' } },
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
                      history: [initialView],
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
