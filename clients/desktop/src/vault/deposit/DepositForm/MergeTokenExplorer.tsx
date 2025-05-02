import { Chain } from '@core/chain/Chain'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { Coin } from '@core/chain/coin/Coin'
import { VStack } from '@lib/ui/layout/Stack'
import { FC } from 'react'

import { Modal } from '../../../lib/ui/modal'
import { DepositActionOption } from './DepositActionOption'

const tokensToMerge = (chain = Chain.Kujira) => {
  const tokens = chainTokens[chain] ?? []
  const tickers = ['KUJI', 'RKUJI', 'FUZN', 'NSTK', 'WINK', 'LVN']
  return tokens.filter(token => tickers.includes(token.ticker))
}

type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
}

export const MergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  return (
    <Modal width={480} placement="top" title="Select Token" onClose={onClose}>
      <VStack gap={20}>
        {tokensToMerge().map((token, index) => {
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
