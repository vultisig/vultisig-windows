import { Chain } from '@core/chain/Chain'
import {
  KujiraThorChainToken,
  kujiraThorChainTokenMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import { Coin } from '@core/chain/coin/Coin'
import { ibcTokens } from '@core/chain/coin/ibc'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '../..'
import { DepositActionOption } from '../../DepositActionOption'

const useUserMergeAcceptedTokens = () => {
  const userCoins = useCurrentVaultCoins()

  return useMemo(() => {
    return userCoins
      .filter(
        coin =>
          coin.chain === Chain.THORChain &&
          ibcTokens.some(
            ibcToken =>
              ibcToken.ticker.toUpperCase() === coin.ticker.toUpperCase()
          ) &&
          kujiraThorChainTokenMergeContracts[
            coin.ticker.toUpperCase() as KujiraThorChainToken
          ]
      )
      .map(coin => ({
        ...coin,
        thorchainAddress:
          kujiraThorChainTokenMergeContracts[
            coin.ticker.toUpperCase() as KujiraThorChainToken
          ],
      }))
  }, [userCoins])
}

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  setValue: UseFormSetValue<FormData>
}

export const MergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  setValue,
}) => {
  const tokens = useUserMergeAcceptedTokens()
  const { t } = useTranslation()

  return (
    <Modal
      width={480}
      placement="top"
      title={t('select_token')}
      onClose={onClose}
    >
      <VStack gap={20}>
        {tokens.length > 0 ? (
          tokens.map((token, index) => {
            return (
              <DepositActionOption
                key={index}
                value={token.ticker}
                isActive={activeOption?.ticker === token.ticker}
                onClick={() => {
                  onOptionClick(token)
                  const selectedMergeAddress = tokens.find(
                    t => t.ticker === token?.ticker
                  )?.thorchainAddress

                  setValue('selectedCoin', token, {
                    shouldValidate: true,
                  })

                  setValue('nodeAddress', selectedMergeAddress, {
                    shouldValidate: true,
                  })

                  onClose()
                }}
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
