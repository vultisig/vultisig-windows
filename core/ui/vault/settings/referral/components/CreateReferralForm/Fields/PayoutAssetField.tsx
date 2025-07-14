import { CoinKey, getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../../../../chain/coin/icon/CoinIcon'
import { CoinOption } from '../../../../../../chain/coin/inputs/CoinOption'
import { ChainOption } from '../../../../../send/components/ChainOption'
import { useCurrentVaultCoins } from '../../../../../state/currentVaultCoins'
import { useActivePoolsQuery } from '../../../queries/useActivePoolsQuery'
import {
  FormField,
  FormFieldErrorText,
  FormFieldLabel,
} from '../../Referrals.styled'
import { ReferralFormData } from '../config'

// Needed due to the nature of the API response
const chainMap: Record<string, string> = {
  AVAX: 'Avalanche',
  BASE: 'Base',
  BCH: 'Bitcoin-Cash',
  BTC: 'Bitcoin',
  DOGE: 'Dogecoin',
  ETH: 'Ethereum',
  GAIA: 'Cosmos',
  LTC: 'Litecoin',
  THOR: 'THORChain',
  XRP: 'XRP Ledger',
}

// Needed due to the nature of the API response
const normChain = (c: string) => (chainMap[c.toUpperCase()] ?? c).toUpperCase()
const normTicker = (t: string) => t.split('-')[0].toUpperCase()

export const PayoutAssetField = () => {
  const [isChainModalOpen, setIsChainModalOpen] = useState(false)
  const coins = useCurrentVaultCoins()
  const { t } = useTranslation()
  const { data: allowedPools = [] } = useActivePoolsQuery()

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
            normChain(a.chain) === normChain(coin.chain) &&
            normTicker(a.ticker) === normTicker(coin.ticker)
        )
      ),
    [allowedAssets, coins]
  )

  const {
    control,
    formState: { errors },
  } = useFormContext<ReferralFormData>()

  return (
    <FormField>
      <FormFieldLabel htmlFor="payout-asset">
        {t('choose_payout_asset')}
      </FormFieldLabel>
      <Controller
        name="payoutAsset"
        control={control}
        render={({ field: { onChange, value: currentValue } }) => {
          const coin = getCoinFromCoinKey(currentValue || coins[0]!)

          return (
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
                        <CoinIcon
                          coin={currentValue}
                          style={{ fontSize: 16 }}
                        />
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
                <>
                  <SelectItemModal
                    renderListHeader={() =>
                      coin && (
                        <HStack alignItems="center" gap={6}>
                          <Text color="shy" size={12} weight={500}>
                            {t('chain')}
                          </Text>
                          <HStack
                            style={{
                              cursor: 'pointer',
                            }}
                            tabIndex={0}
                            role="button"
                            onClick={() => {
                              setIsChainModalOpen(true)
                            }}
                            gap={4}
                          >
                            <CoinIcon coin={coin} style={{ fontSize: 16 }} />
                            <HStack alignItems="center">
                              <Text size={12} weight={500}>
                                {coin.chain}
                              </Text>
                              <ChevronDownIcon />
                            </HStack>
                          </HStack>
                        </HStack>
                      )
                    }
                    filterFunction={(option, query) =>
                      option.ticker
                        .toLowerCase()
                        .startsWith(query.toLowerCase())
                    }
                    title={t('choose_payout_asset')}
                    optionComponent={CoinOption}
                    onFinish={(newValue: CoinKey | undefined) => {
                      if (newValue) {
                        onChange(newValue)
                      }
                      onClose()
                    }}
                    options={allowedCoins.filter(c => c.chain === coin?.chain)}
                  />
                  {isChainModalOpen && (
                    <SelectItemModal
                      title={t('select_network')}
                      optionComponent={props => {
                        const currentItemChain = props.value.chain
                        const isSelected = currentItemChain === coin?.chain

                        return (
                          <ChainOption {...props} isSelected={isSelected} />
                        )
                      }}
                      onFinish={(newValue: CoinKey | undefined) => {
                        if (newValue) {
                          onChange(newValue)
                        }
                        setIsChainModalOpen(false)
                      }}
                      options={coins}
                      filterFunction={(option, query) =>
                        option.chain
                          .toLowerCase()
                          .startsWith(query.toLowerCase())
                      }
                    />
                  )}
                </>
              )}
            />
          )
        }}
      />
      {errors.payoutAsset && (
        <FormFieldErrorText>{errors.payoutAsset.message}</FormFieldErrorText>
      )}
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
