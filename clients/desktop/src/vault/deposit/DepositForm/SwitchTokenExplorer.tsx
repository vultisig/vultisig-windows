import { Chain } from '@core/chain/Chain'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { Coin } from '@core/chain/coin/Coin'
import { VStack } from '@lib/ui/layout/Stack'
import { FC } from 'react'

import { Modal } from '../../../lib/ui/modal'
import { DepositActionOption } from './DepositActionOption'

const tokensToSwitch = (chain = Chain.Kujira): Coin[] => {
  const tokens = chainTokens[chain] ?? []
  const switchableTickers = ['KUJI', 'rKUJI', 'FUZN', 'NSTK', 'WINK', 'LVN']
  return tokens.filter(token => switchableTickers.includes(token.ticker))
}

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
  return (
    <Modal width={480} placement="top" title="Select Token" onClose={onClose}>
      <VStack gap={20}>
        {tokensToSwitch().map((token, index) => {
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
