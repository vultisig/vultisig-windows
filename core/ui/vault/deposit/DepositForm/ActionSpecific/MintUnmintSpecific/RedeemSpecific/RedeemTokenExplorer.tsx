import { yieldBearingAssetsIds } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { yieldBearingAssetsReceiptDenoms } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { Coin } from '@core/chain/coin/Coin'
import { FormData } from '@core/ui/vault/deposit/DepositForm'
import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC, useMemo } from 'react'
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
  const coinById = useMemo(() => new Map(coins.map(c => [c.id, c])), [coins])

  const tokens = useMemo(
    () =>
      yieldBearingAssetsIds.map(asset => {
        const denom = yieldBearingAssetsReceiptDenoms[asset]
        return coinById.get(denom) ?? createMintUnmintCoin(denom)
      }),
    [coinById]
  )

  return (
    <Modal onClose={onClose} title={t('select_token')}>
      <VStack gap={20}>
        {tokens.map((token, index) => {
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
