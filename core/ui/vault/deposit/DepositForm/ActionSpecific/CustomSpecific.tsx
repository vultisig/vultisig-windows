import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { Container } from '../DepositForm.styled'
import { TokenExplorer } from '../TokenExplorer'

export const CustomSpecific = () => {
  const { t } = useTranslation()
  const [selectedCoin, setDepositCoin] = useDepositCoin()
  const allCoins = useCurrentVaultCoins()
  const tokens = allCoins.filter(coin => coin.chain === selectedCoin.chain)

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {selectedCoin.ticker || t('select_token')}
            </Text>
          </HStack>
          <IconWrapper style={{ fontSize: 20 }}>
            <ChevronRightIcon />
          </IconWrapper>
        </Container>
      )}
      renderContent={({ onClose }) => (
        <TokenExplorer
          options={tokens}
          activeOption={selectedCoin}
          onOptionClick={token => setDepositCoin(token)}
          onClose={onClose}
        />
      )}
    />
  )
}
