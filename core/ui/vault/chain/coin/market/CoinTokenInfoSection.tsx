import { resolveMarketDataSource } from '@core/ui/chain/coin/price/market/MarketDataSource'
import { FiatAmountText } from '@core/ui/chain/components/FiatAmountText'
import { useCore } from '@core/ui/state/core'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareBehindSquare6Icon } from '@lib/ui/icons/SquareBehindSquare6Icon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinDetailSection } from './CoinDetailSection'
import { CoinMarketStatRow } from './CoinMarketStatRow'

type CoinTokenInfoSectionProps = {
  coin: VaultChainCoin
}

/**
 * Static coin facts: network, contract address with copy, decimals, and a
 * block explorer link — the token's contract page when the chain's explorer
 * can render one, the vault's address page otherwise. Coins without a price
 * chart (pool-priced tokens) also get their spot price row here so it stays
 * visible.
 */
export const CoinTokenInfoSection = ({ coin }: CoinTokenInfoSectionProps) => {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const { openUrl } = useCore()
  const { priceProviderId } = useCurrentVaultCoin(coin)
  const address = useCurrentVaultAddress(coin.chain)
  const { id } = coin

  const source = resolveMarketDataSource({
    chain: coin.chain,
    id,
    priceProviderId,
  })

  const explorerUrl = getBlockExplorerUrl({
    chain: coin.chain,
    entity: 'address',
    value: id && isChainOfKind(coin.chain, 'evm') ? id : address,
  })

  const handleCopyContract = (contract: string) => {
    navigator.clipboard.writeText(contract)
    addToast({ message: t('contract_address_copied') })
  }

  return (
    <CoinDetailSection title={t('token_info')}>
      {source === null ? (
        <CoinMarketStatRow
          label={t('price')}
          value={<FiatAmountText value={coin.price || 0} />}
        />
      ) : null}
      <CoinMarketStatRow label={t('network')} value={coin.chain} />
      {id ? (
        <CoinMarketStatRow
          label={t('contract')}
          value={
            <ContractButton onClick={() => handleCopyContract(id)}>
              <Text size={13} weight={500} color="contrast">
                {formatWalletAddress(id)}
              </Text>
              <IconWrapper size={14}>
                <SquareBehindSquare6Icon />
              </IconWrapper>
            </ContractButton>
          }
        />
      ) : null}
      <CoinMarketStatRow label={t('decimals')} value={String(coin.decimals)} />
      <CoinMarketStatRow
        label={t('view_on_explorer')}
        value={
          <ExplorerButton onClick={() => openUrl(explorerUrl)}>
            <IconWrapper size={16}>
              <ArrowUpRightIcon />
            </IconWrapper>
          </ExplorerButton>
        }
      />
    </CoinDetailSection>
  )
}

const ContractButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: ${getColor('textShy')};

  &:hover {
    color: ${getColor('contrast')};
  }
`

const ExplorerButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${getColor('textShy')};

  &:hover {
    color: ${getColor('contrast')};
  }
`
