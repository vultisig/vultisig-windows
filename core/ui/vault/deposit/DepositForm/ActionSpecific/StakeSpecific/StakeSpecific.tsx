import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { Match } from '@lib/ui/base/Match'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { StakeableChain } from '../../../config'
import { useDepositCoin } from '../../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../../DepositForm.styled'
import { StakeTokenExplorer } from './StakeTokenExplorer'

export const StakeSpecific = () => {
  const [{ chain, register }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const [selectedCoin, setSelectedCoin] = useDepositCoin()

  return (
    <Match
      value={chain as StakeableChain}
      THORChain={() => (
        <Opener
          renderOpener={({ onOpen }) => (
            <VStack gap={8}>
              <Container onClick={onOpen}>
                <HStack alignItems="center" gap={4}>
                  <Text weight="400" family="mono" size={16}>
                    {selectedCoin.ticker || t('select_token')}
                  </Text>
                  {!selectedCoin && (
                    <AssetRequiredLabel as="span" color="danger" size={14}>
                      *
                    </AssetRequiredLabel>
                  )}
                </HStack>
                <IconWrapper style={{ fontSize: 20 }}>
                  <ChevronRightIcon />
                </IconWrapper>
              </Container>
              {selectedCoin?.id === tcyAutoCompounderConfig.depositDenom && (
                <label
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <input type="checkbox" {...register('autoCompound')} />
                  <Text>
                    {t('auto_compound_into_label', {
                      ticker: tcyAutoCompounderConfig.shareTicker,
                    })}
                  </Text>
                </label>
              )}
            </VStack>
          )}
          renderContent={({ onClose }) => (
            <StakeTokenExplorer
              activeOption={selectedCoin}
              onOptionClick={token => {
                setSelectedCoin(token)
                onClose()
              }}
              onClose={onClose}
            />
          )}
        />
      )}
      Ton={() => null}
    />
  )
}
