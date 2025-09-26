import { extractCoinKey } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useCopyAddress } from '@core/ui/chain/hooks/useCopyAddress'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultAddressLink } from '@core/ui/vault/chain/VaultAddressLink'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { useVaultChainCoinsQuery } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { splitBy } from '@lib/utils/array/splitBy'
import { sum } from '@lib/utils/array/sum'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { useTranslation } from 'react-i18next'

import { useFormatFiatAmount } from '../../chain/hooks/useFormatFiatAmount'

export const VaultChainBalancesSection = () => {
  const chain = useCurrentVaultChain()
  const address = useCurrentVaultAddress(chain)
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const formatFiatAmount = useFormatFiatAmount()
  const copyAddress = useCopyAddress()
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <Panel withSections>
      <VStack fullWidth gap={8}>
        <HStack fullWidth alignItems="center" justifyContent="space-between">
          <HStack alignItems="center" gap={12}>
            <ChainEntityIcon
              value={getChainLogoSrc(chain)}
              style={{ fontSize: 32 }}
            />
            <Text weight="700" color="contrast">
              {chain}
            </Text>
          </HStack>
          <HStack>
            <IconButton
              onClick={() => copyAddress(address)}
              title="Copy address"
            >
              <CopyIcon />
            </IconButton>
            <IconButton
              onClick={() => navigate({ id: 'address', state: { address } })}
              title="Address QR code"
            >
              <QrCodeIcon />
            </IconButton>
            <VaultAddressLink value={address} />
          </HStack>
        </HStack>
        <MatchQuery
          value={vaultCoinsQuery}
          error={() => t('failed_to_load')}
          pending={() => <Spinner />}
          success={coins => {
            const total = sum(
              coins.map(({ amount, decimals, price = 0 }) =>
                getCoinValue({
                  amount,
                  decimals,
                  price,
                })
              )
            )

            return (
              <Text size={20} weight="700" color="contrast" centerVertically>
                <BalanceVisibilityAware>
                  {formatFiatAmount(total)}
                </BalanceVisibilityAware>
              </Text>
            )
          }}
        />
        <Text size={14} weight="500" color="primary">
          <BalanceVisibilityAware size="xxxl">{address}</BalanceVisibilityAware>
        </Text>
      </VStack>
      <MatchQuery
        value={vaultCoinsQuery}
        error={() => t('failed_to_load')}
        pending={() => (
          <VStack fullWidth>
            <Spinner />
          </VStack>
        )}
        success={coins => {
          const orderedCoins = withoutDuplicates(
            splitBy(coins, coin => (isFeeCoin(coin) ? 0 : 1))
              .map(sortCoinsByBalance)
              .flat(),
            (one, another) => one.ticker === another.ticker
          ).map(adjustVaultChainCoinsLogos)

          return orderedCoins.map((coin, idx) => (
            <UnstyledButton
              key={`${idx}-${coin.id}`}
              onClick={() =>
                navigate({
                  id: 'vaultChainCoinDetail',
                  state: { coin: extractCoinKey(coin) },
                })
              }
            >
              <VaultChainCoinItem value={coin} />
            </UnstyledButton>
          ))
        }}
      />
    </Panel>
  )
}
