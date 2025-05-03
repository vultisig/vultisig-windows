import { Coin } from '@core/chain/coin/Coin'
import { VStack } from '@lib/ui/layout/Stack'
import { FC } from 'react'

import { Modal } from '../../../lib/ui/modal'
import { useMergeAcceptedTokens } from '../hooks/useMergeAcceptedTokens'
import { DepositActionOption } from './DepositActionOption'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
}

export const SwitchTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const tokens = useMergeAcceptedTokens()

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
