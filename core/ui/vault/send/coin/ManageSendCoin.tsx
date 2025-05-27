import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '../../../chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '../../../chain/coin/icon/utils/shouldDisplayChainLogo'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { HorizontalLine } from '../components/HorizontalLine'
import { SendCoinInput } from '../components/SendCoinInput'
import { SendInputContainer } from '../components/SendInputContainer'
import { useFocusedSendField } from '../providers/FocusedSendFieldProvider'

export const ManageSendCoin = () => {
  const [
    {
      field,
      fieldsChecked: { coin: isCoinFieldChecked },
    },
    setFocusedSendField,
  ] = useFocusedSendField()
  const [{ coin: coinKey }, setViewState] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { t } = useTranslation()
  const { logo, ticker, chain, id } = coin
  const isOpen = field === 'coin'

  return (
    <>
      <AnimatedVisibility isOpen={isOpen} animationConfig="topToBottom">
        <SendInputContainer
          onClick={() => {
            setFocusedSendField(state => ({
              field: null,
              fieldsChecked: {
                ...state.fieldsChecked,
                coin: true,
              },
            }))
          }}
        >
          <InputLabel>{t('asset_selection')}</InputLabel>
          <HorizontalLine />
          <SendCoinInput
            value={coin}
            onChange={coin => setViewState(prev => ({ ...prev, coin }))}
          />
        </SendInputContainer>
      </AnimatedVisibility>

      <AnimatedVisibility
        animationConfig="exitToTop"
        isOpen={!isOpen}
        delay={300}
      >
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
      </AnimatedVisibility>
    </>
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
