import { chainsWithTokenMetadataDiscovery } from '@core/chain/coin/token/metadata/chains'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultChain } from '../../useCurrentVaultChain'

export const AddCustomTokenPrompt = () => {
  const chain = useCurrentVaultChain()
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  if (isOneOf(chain, chainsWithTokenMetadataDiscovery)) {
    return (
      <CustomTokenCard
        onClick={() => navigate({ id: 'addCustomToken', state: { chain } })}
      >
        <CustomIconWrapper>
          <PlusIcon />
        </CustomIconWrapper>
        <TextWrapper>
          <Text cropped color="contrast" size={12} weight={500}>
            {t('custom_token')}
          </Text>
        </TextWrapper>
      </CustomTokenCard>
    )
  }
}

const TextWrapper = styled.div`
  min-width: 0;
  width: 100%;
  text-align: center;
`

const CustomTokenCard = styled(UnstyledButton)`
  ${vStack({
    gap: 11,
    alignItems: 'center',
  })};

  width: 74px;
`

const CustomIconWrapper = styled.div`
  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};
  position: relative;
  align-self: stretch;
  background: rgba(11, 26, 58, 0.5);
  height: 74px;
  padding: 17px;
  font-size: 27.5px;
  color: ${getColor('buttonPrimary')};
  border-radius: 24px;
  border: 1.5px dashed ${getColor('foregroundSuper')};
  opacity: 0.6;
  background: ${getColor('foreground')};
`
