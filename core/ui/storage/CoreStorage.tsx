import { AddressBookStorage } from './addressBook'
import { BalanceVisibilityStorage } from './balanceVisibility'
import { BlockaidStorage } from './blockaid'
import { CircleVisibilityStorage } from './circleVisibility'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { CustomRpcOverridesStorage } from './customRpcOverrides'
import { DefiChainsStorage } from './defiChains'
import { DefiPositionsStorage } from './defiPositions'
import { DismissedBannersStorage } from './dismissedBanners'
import { FiatCurrencyStorage } from './fiatCurrency'
import { HasSeenNotificationPromptStorage } from './hasSeenNotificationPrompt'
import { LanguageStorage } from './language'
import { LimitPriceChartExpansionStorage } from './limitPriceChartExpanded'
import { MLDSAEnabledStorage } from './mldsaEnabled'
import { OnboardingStorage } from './onboarding'
import { PasscodeAutoLockStorage } from './passcodeAutoLock'
import { PasscodeEncryptionStorage } from './passcodeEncryption'
import { PasscodeUnlockSessionStorage } from './passcodeUnlockSession'
import { ReferralsStorage } from './referrals'
import { SolanaMoveStakeDestinationsStorage } from './solanaMoveStakeDestinations'
import { TonW5EnabledStorage } from './tonW5Enabled'
import { TransactionHistoryStorage } from './transactionHistory'
import { TssBatchingEnabledStorage } from './tssBatchingEnabled'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export type CoreStorage = CoinFinderIgnoreStorage &
  CircleVisibilityStorage &
  DefiChainsStorage &
  DefiPositionsStorage &
  FiatCurrencyStorage &
  HasSeenNotificationPromptStorage &
  CurrentVaultIdStorage &
  VaultsStorage &
  VaultFoldersStorage &
  CoinsStorage &
  AddressBookStorage &
  LanguageStorage &
  LimitPriceChartExpansionStorage &
  BalanceVisibilityStorage &
  BlockaidStorage &
  OnboardingStorage &
  ReferralsStorage &
  PasscodeEncryptionStorage &
  PasscodeAutoLockStorage &
  PasscodeUnlockSessionStorage &
  DismissedBannersStorage &
  MLDSAEnabledStorage &
  TssBatchingEnabledStorage &
  TonW5EnabledStorage &
  CustomRpcOverridesStorage &
  SolanaMoveStakeDestinationsStorage &
  TransactionHistoryStorage
