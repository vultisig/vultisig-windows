import { yAssetReceiptDenoms } from '@core/chain/chains/cosmos/thor/yAssets/config'
import { Coin } from '@core/chain/coin/Coin'
import { FormData } from '@core/ui/vault/deposit/DepositForm'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoins } from '../../../../../state/currentVaultCoins'
import { createMintUnmintCoin } from '../utils'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  setValue: UseFormSetValue<FormData>
}

export const RedeemTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation()
  const coins = useCurrentVaultCoins()
  const yRUNE =
    coins.find(c => c.id === yAssetReceiptDenoms['yRUNE']) ??
    createMintUnmintCoin(yAssetReceiptDenoms['yRUNE'])
  const yTCY =
    coins.find(c => c.id === yAssetReceiptDenoms['yTCY']) ??
    createMintUnmintCoin(yAssetReceiptDenoms['yTCY'])

  return (
    <Modal onClose={onClose} title={t('select_token')}>
      <VStack gap={20}>
        {[yRUNE, yTCY].map((token, index) => {
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
