import { Coin } from '@core/chain/coin/Coin'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  STAKEABLE_ASSETS_TICKERS,
  StakeableAssetTicker,
} from '../../../constants'
import { FormData } from '../..'
import { DepositActionOption } from '../../DepositActionOption'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  setValue: UseFormSetValue<FormData>
}

export const StakeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const coins = useCurrentVaultCoins().filter(coin =>
    STAKEABLE_ASSETS_TICKERS.includes(coin.ticker as StakeableAssetTicker)
  )
  const { t } = useTranslation()

  return (
    <Modal
      width={480}
      placement="top"
      title={t('select_token')}
      onClose={onClose}
    >
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
