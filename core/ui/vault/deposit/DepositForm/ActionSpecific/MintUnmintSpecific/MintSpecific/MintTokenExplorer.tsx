import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { FormData } from '@core/ui/vault/deposit/DepositForm'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoin } from '../../../../../state/currentVaultCoins'
import { createMintUnmintCoin } from '../utils'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  setValue: UseFormSetValue<FormData>
}

export const MintTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation()
  const tcyInVault = useCurrentVaultCoin({
    id: 'tcy',
    chain: Chain.THORChain,
  })

  return (
    <Modal onClose={onClose} title={t('select_token')}>
      <VStack gap={20}>
        {[
          chainFeeCoin.THORChain,
          tcyInVault ?? createMintUnmintCoin('tcy'),
        ].map((token, index) => {
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
