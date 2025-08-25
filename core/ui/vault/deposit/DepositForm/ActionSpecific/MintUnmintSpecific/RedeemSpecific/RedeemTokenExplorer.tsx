import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../../../providers/DepositCoinProvider'

type Props = {
  onOptionClick: (option: AccountCoin) => void
  onClose: () => void
  options: AccountCoin[]
}

export const RedeemTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  options,
}) => {
  const [selectedCoin] = useDepositCoin()
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_token')}>
      <VStack gap={20}>
        {options.map((token, index) => {
          return (
            <DepositActionOption
              key={index}
              value={token.ticker}
              isActive={selectedCoin.ticker === token.ticker}
              onClick={() => onOptionClick(token)}
            />
          )
        })}
      </VStack>
    </Modal>
  )
}
