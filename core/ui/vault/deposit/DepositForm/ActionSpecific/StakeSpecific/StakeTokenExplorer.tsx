import { AccountCoin } from '@core/chain/coin/AccountCoin'
import {
  stakeableAssetsTickers,
  StakeableAssetTicker,
} from '@core/ui/vault/deposit/config'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../../providers/DepositCoinProvider'

type Props = {
  activeOption?: AccountCoin
  onOptionClick: (option: AccountCoin) => void
  onClose: () => void
}

export const StakeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const [depositCoin] = useDepositCoin()
  const coins = useCurrentVaultChainCoins(depositCoin.chain).filter(coin =>
    stakeableAssetsTickers.includes(coin.ticker as StakeableAssetTicker)
  )
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_token')}>
      <VStack gap={20}>
        {coins.length > 0 ? (
          coins.map((token, index) => {
            return (
              <DepositActionOption
                key={index}
                value={token.ticker}
                isActive={activeOption?.ticker === token.ticker}
                onClick={() => onOptionClick(token)}
              />
            )
          })
        ) : (
          <Text size={16} color="contrast">
            {t('no_tokens_found')}
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
