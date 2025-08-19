import {
  yieldBearingAssetsIds,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { Coin } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoins } from '../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../../../DepositForm.styled'
import { createMintUnmintCoin } from '../utils'
import { RedeemTokenExplorer } from './RedeemTokenExplorer'

export const RedeemSpecific = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const coins = useCurrentVaultCoins()

  const { t } = useTranslation()
  const selectedCoin = getValues('selectedCoin') as Coin | null
  const coinById = useMemo(() => new Map(coins.map(c => [c.id, c])), [coins])

  const tokens = useMemo(
    () =>
      yieldBearingAssetsIds.map(asset => {
        const denom = yieldBearingAssetsReceiptDenoms[asset]
        return coinById.get(denom) ?? createMintUnmintCoin(denom)
      }),
    [coinById]
  )

  useEffect(() => {
    if (!tokens.some(token => token.ticker === selectedCoin?.ticker)) {
      setValue('selectedCoin', tokens[0], {
        shouldValidate: true,
      })
    }
  }, [selectedCoin?.ticker, setValue, tokens])

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {selectedCoin?.ticker || t('select_token')}
            </Text>
            {!selectedCoin && (
              <AssetRequiredLabel as="span" color="danger" size={14}>
                *
              </AssetRequiredLabel>
            )}
          </HStack>
          <IconWrapper style={{ fontSize: 20 }}>
            <ChevronRightIcon />
          </IconWrapper>
        </Container>
      )}
      renderContent={({ onClose }) => (
        <RedeemTokenExplorer
          options={tokens}
          onOptionClick={token => {
            setValue('selectedCoin', token, {
              shouldValidate: true,
            })
            onClose()
          }}
          onClose={onClose}
        />
      )}
    />
  )
}
