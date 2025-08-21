import {
  yieldBearingAssetsIds,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  useCurrentVaultAddresses,
  useCurrentVaultCoins,
} from '../../../../../state/currentVaultCoins'
import { useDepositCoin } from '../../../../providers/DepositCoinProvider'
import { AssetRequiredLabel, Container } from '../../../DepositForm.styled'
import { createMintUnmintCoin } from '../utils'
import { RedeemTokenExplorer } from './RedeemTokenExplorer'

export const RedeemSpecific = () => {
  const coins = useCurrentVaultCoins()

  const { t } = useTranslation()
  const [selectedCoin, setSelectedCoin] = useDepositCoin()
  const coinById = useMemo(() => new Map(coins.map(c => [c.id, c])), [coins])
  const address = useCurrentVaultAddresses()[selectedCoin.chain]
  const tokens = useMemo(
    () =>
      yieldBearingAssetsIds.map(asset => {
        const denom = yieldBearingAssetsReceiptDenoms[asset]
        return coinById.get(denom) ?? createMintUnmintCoin(denom, address)
      }),
    [coinById, address]
  )

  useEffect(() => {
    if (!tokens.some(token => token.ticker === selectedCoin?.ticker)) {
      setSelectedCoin(tokens[0])
    }
  }, [selectedCoin?.ticker, setSelectedCoin, tokens])

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
            setSelectedCoin(token)
            onClose()
          }}
          onClose={onClose}
        />
      )}
    />
  )
}
