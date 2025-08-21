import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  useCurrentVaultAddresses,
  useCurrentVaultChainCoins,
} from '../../../../../state/currentVaultCoins'
import { useDepositCoin } from '../../../../providers/DepositCoinProvider'
import { AssetRequiredLabel, Container } from '../../../DepositForm.styled'
import { createMintUnmintCoin } from '../utils'
import { MintTokenExplorer } from './MintTokenExplorer'

export const MintSpecific = () => {
  const { t } = useTranslation()
  const [selectedCoin, setSelectedCoin] = useDepositCoin()
  const coins = useCurrentVaultChainCoins(Chain.THORChain)
  const address = useCurrentVaultAddresses()[selectedCoin.chain]
  const tcyInVault = coins.find(c => c.id === 'tcy')

  const options = useMemo(
    () => [
      { ...chainFeeCoin.THORChain, address },
      tcyInVault ?? createMintUnmintCoin('tcy', address),
    ],
    [tcyInVault, address]
  )

  useEffect(() => {
    if (!options.some(token => token.ticker === selectedCoin?.ticker)) {
      setSelectedCoin(options[0])
    }
  }, [options, selectedCoin?.ticker, setSelectedCoin])

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
          activeOption={selectedCoin}
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
