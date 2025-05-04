import { Coin } from '@core/chain/coin/Coin'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { Modal } from '../../../lib/ui/modal'
import { DepositActionOption } from './DepositActionOption'

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  options: Coin[]
}

export const TokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
  options,
}) => {
  return (
    <Modal width={480} placement="top" title="Select Token" onClose={onClose}>
      <VStack gap={20}>
        {options.length > 0 ? (
          options.map((token, index) => {
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
          })
        ) : (
          <Text size={16} color="contrast">
            No tokens found. Add tokens under the desired Chain.
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
