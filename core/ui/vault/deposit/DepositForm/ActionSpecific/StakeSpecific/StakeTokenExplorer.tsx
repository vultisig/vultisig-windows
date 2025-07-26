import { Coin } from '@core/chain/coin/Coin'
import {
  stakeableAssetsTickers,
  StakeableAssetTicker,
} from '@core/ui/vault/deposit/config'
import { FormData } from '@core/ui/vault/deposit/DepositForm'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
