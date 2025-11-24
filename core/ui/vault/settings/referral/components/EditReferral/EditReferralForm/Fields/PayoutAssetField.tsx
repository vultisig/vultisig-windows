import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { Opener } from '@lib/ui/base/Opener'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../../../../../chain/coin/icon/CoinIcon'
import { CoinOption } from '../../../../../../../chain/coin/inputs/CoinOption'
import { useCurrentVaultCoins } from '../../../../../../state/currentVaultCoins'
import { useReferralPayoutAsset } from '../../../../providers/ReferralPayoutAssetProvider'
import { useActivePoolsQuery } from '../../../../queries/useActivePoolsQuery'
import { FormField, FormFieldLabel } from '../../../Referrals.styled'
import { normaliseChainToMatchPoolChain } from '../config'

const normTicker = (t: string) => t.split('-')[0].toUpperCase()

export const PayoutAssetField = () => {
  const coins = useCurrentVaultCoins()
  const { t } = useTranslation()
  const { data: allowedPools = [] } = useActivePoolsQuery()
  const [currentValue, setCurrentValue] = useReferralPayoutAsset()

  const allowedAssets = useMemo(
    () =>
      allowedPools.map(pool => {
        const [chain, ticker] = pool.asset.split('.')

        return {
          chain,
          ticker,
        }
      }),
    [allowedPools]
  )

  const allowedCoins = useMemo(
    () =>
      coins.filter(coin =>
        allowedAssets.some(
          a =>
            normaliseChainToMatchPoolChain(a.chain) ===
              normaliseChainToMatchPoolChain(coin.chain) &&
            normTicker(a.ticker) === normTicker(coin.ticker)
        )
      ),
    [allowedAssets, coins]
  )

  const coin: AccountCoin = currentValue ?? coins[0]!

  return (
    <FormField>
      <FormFieldLabel htmlFor="payout-asset">
        {t('choose_payout_asset')}
      </FormFieldLabel>
      <Opener
        renderOpener={({ onOpen }) => (
          <PayoutAssetTrigger
            tabIndex={0}
            role="button"
            onClick={onOpen}
            justifyContent="space-between"
            alignItems="center"
          >
            {currentValue ? (
              <>
                <HStack alignItems="center" gap={6}>
                  <CoinIcon coin={currentValue} style={{ fontSize: 16 }} />
                  <Text size={16} weight={500}>
                    {currentValue.id}
                  </Text>
                </HStack>
              </>
            ) : (
              <Text>{t('select')}</Text>
            )}
            <IconWrapper
              style={{
                fontSize: 20,
              }}
            >
              <ChevronRightIcon />
            </IconWrapper>
          </PayoutAssetTrigger>
        )}
        renderContent={({ onClose }) => (
          <SelectItemModal
            filterFunction={(option, query) =>
              option.ticker.toLowerCase().startsWith(query.toLowerCase())
            }
            title={t('choose_payout_asset')}
            optionComponent={CoinOption}
            onFinish={(newValue: AccountCoin | undefined) => {
              if (!newValue) {
                onClose()
                return
              }
              setCurrentValue(newValue)
              onClose()
            }}
            options={allowedCoins.filter(c => c.chain === coin?.chain)}
          />
        )}
      />
    </FormField>
  )
}

const PayoutAssetTrigger = styled(HStack)`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  cursor: pointer;
  ${borderRadius.m};
`
