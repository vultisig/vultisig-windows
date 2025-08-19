import { Coin } from '@core/chain/coin/Coin'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  options: Coin[]
}

export const MintTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  options,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_token')}>
      <VStack gap={20}>
        {options.map((token, index) => {
          return (
            <DepositActionOption
              key={index}
              value={token.ticker}
              isActive={activeOption?.ticker === token.ticker}
              onClick={() => onOptionClick(token)}
            />
          )
        })}
      </VStack>
    </Modal>
  )
}
