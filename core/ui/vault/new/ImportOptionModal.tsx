import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { FileTextIcon } from '@lib/ui/icons/FileTextIcon'
import { WandSparklesIcon } from '@lib/ui/icons/WandSparklesIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ImportOption } from './ImportOption'

const NewBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const NewText = styled(Text)`
  color: ${getColor('idle')};
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12px;
  text-transform: uppercase;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${getColor('contrast')};

  svg {
    font-size: 20px;
  }
`

const BadgeIcon = styled(WandSparklesIcon)`
  font-size: 12px;
  color: ${getColor('idle')};
`

export const ImportOptionModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      containerStyles={{
        padding: '32px 24px 40px',
      }}
    >
      <VStack gap={20}>
        <Text
          size={17}
          weight="500"
          color="contrast"
          centerHorizontally
          style={{ lineHeight: '20px', letterSpacing: '-0.3px' }}
        >
          {t('recover_vault_or_convert_seedphrase')}
        </Text>
        <VStack gap={14}>
          <ImportOption
            icon={
              <VStack alignItems="start" gap={12}>
                <NewBadge>
                  <BadgeIcon />
                  <NewText>NEW</NewText>
                </NewBadge>
                <IconContainer>
                  <WandSparklesIcon />
                  <Text size={15} weight="500">
                    {t('import_seedphrase')}
                  </Text>
                </IconContainer>
              </VStack>
            }
            title=""
            onClick={() => {
              navigate({ id: 'importSeedphrase' })
              onClose()
            }}
          >
            <Text size={13} weight="500" color="supporting">
              {t('import_seedphrase_description')}
            </Text>
          </ImportOption>

          <ImportOption
            icon={
              <IconContainer>
                <FileTextIcon />
                <Text size={15} weight="500">
                  {t('import_vault_share')}
                </Text>
              </IconContainer>
            }
            title=""
            onClick={() => {
              navigate({ id: 'importVault' })
              onClose()
            }}
          >
            <VStack alignItems="start" gap={8}>
              <Text size={13} weight="500" color="supporting">
                {t('import_vault_share_description')}
              </Text>
              <Text size={10} weight="500" color="shy">
                {t('import_vault_share_supported_files')}
              </Text>
            </VStack>
          </ImportOption>
        </VStack>
      </VStack>
    </ResponsiveModal>
  )
}

