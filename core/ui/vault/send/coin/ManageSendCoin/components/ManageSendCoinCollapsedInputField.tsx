import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../../../chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '../../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '../../../../../chain/coin/icon/utils/shouldDisplayChainLogo'
import { getChainLogoSrc } from '../../../../../chain/metadata/getChainLogoSrc'
import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../../../state/currentVaultCoins'
import { SendInputContainer } from '../../../components/SendInputContainer'
import { useFocusedSendField } from '../../../providers/FocusedSendFieldProvider'

export const ManageSendCoinCollapsedInputField = () => {
  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { logo, ticker, chain, id } = coin

  const [
    {
      field,
      fieldsChecked: { coin: isCoinFieldChecked },
    },
    setFocusedSendField,
  ] = useFocusedSendField()
  const isOpen = field === 'coin'

  return (
    <CollapsedCoinInputContainer
      onClick={() => {
        setFocusedSendField(state => ({
          ...state,
          field: 'coin',
        }))
      }}
    >
      <HStack gap={12} alignItems="center">
        <Text size={14}>{t('asset')}</Text>
        <HStack gap={4} alignItems="center">
          <ChainCoinIcon
            coinSrc={logo ? getCoinLogoSrc(logo) : undefined}
            chainSrc={
              shouldDisplayChainLogo({
                ticker: ticker,
                chain: chain,
                isNative: isFeeCoin({
                  id: id,
                  chain: chain,
                }),
              })
                ? getChainLogoSrc(chain)
                : undefined
            }
            style={{ fontSize: 16 }}
          />
          <Text size={12} color="shy">
            {ticker}
          </Text>
        </HStack>
      </HStack>
      <HStack gap={12}>
        {isCoinFieldChecked && (
          <IconWrapper>
            <CheckmarkIcon />
          </IconWrapper>
        )}
        {!isOpen && (
          <PencilIconWrapper>
            <PencilIcon />
          </PencilIconWrapper>
        )}
      </HStack>
    </CollapsedCoinInputContainer>
  )
}

const CollapsedCoinInputContainer = styled(SendInputContainer)`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`

const IconWrapper = styled.div`
  font-size: 16px;
  color: ${getColor('success')};
  line-height: 0;
  border-radius: 99px;
  border: 1px solid ${getColor('success')};
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
  font-size: 16px;
`
