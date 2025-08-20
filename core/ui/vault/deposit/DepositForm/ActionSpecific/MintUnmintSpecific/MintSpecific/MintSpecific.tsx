import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoin } from '../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../../../DepositForm.styled'
import { createMintUnmintCoin } from '../utils'
import { MintTokenExplorer } from './MintTokenExplorer'

export const MintSpecific = () => {
  const [{ setValue, watch, getValues }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const selectedCoin = getValues('selectedCoin') as Coin | null

  const tcyInVault = useCurrentVaultCoin({
    id: 'tcy',
    chain: Chain.THORChain,
  })

  const options = useMemo(
    () => [chainFeeCoin.THORChain, tcyInVault ?? createMintUnmintCoin('tcy')],
    [tcyInVault]
  )

  useEffect(() => {
    if (!options.some(token => token.ticker === selectedCoin?.ticker)) {
      setValue('selectedCoin', options[0], {
        shouldValidate: true,
      })
    }
  }, [options, selectedCoin?.ticker, setValue])

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
        <MintTokenExplorer
          options={options}
          activeOption={watch('selectedCoin')}
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
