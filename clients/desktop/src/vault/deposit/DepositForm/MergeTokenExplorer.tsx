import { Coin } from '@core/chain/coin/Coin'
import { VStack } from '@lib/ui/layout/Stack'
import { FC, useEffect } from 'react'
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import { Modal } from '../../../lib/ui/modal'
import { useMergeAcceptedTokens } from '../hooks/useMergeAcceptedTokens'
import { FormData } from '.'
import { DepositActionOption } from './DepositActionOption'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  getValues: UseFormGetValues<FormData>
  setValue: UseFormSetValue<FormData>
}

export const MergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  getValues,
  setValue,
}) => {
  const tokens = useMergeAcceptedTokens()
  const selectedCoin = getValues('selectedCoin')

  useEffect(() => {
    const selectedMergeAddress = tokens.find(
      t => t.ticker === selectedCoin?.ticker
    )

    setValue('nodeAddress', selectedMergeAddress?.address, {
      shouldValidate: true,
    })
  }, [selectedCoin?.ticker, setValue, tokens])

  return (
    <Modal width={480} placement="top" title="Select Token" onClose={onClose}>
      <VStack gap={20}>
        {tokens.map((token, index) => {
          return (
            <DepositActionOption
              key={index}
              value={token.ticker}
              isActive={activeOption?.ticker === token.ticker}
              onClick={() => {
                onOptionClick(token)
                onClose()
              }}
            />
          )
        })}
      </VStack>
    </Modal>
  )
}
