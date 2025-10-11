import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { DeviceIcon } from '@lib/ui/icons/DeviceIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const VaultDetailsPage = () => {
  const { t } = useTranslation()
  const { name, publicKeys, signers, localPartyId, libType } = useCurrentVault()
  const totalSigners = signers.length
  const localPartyIndex = signers.indexOf(localPartyId) + 1
  const threshold = getKeygenThreshold(totalSigners)

  const handleCopyToClipboard = (value: string) =>
    navigator.clipboard.writeText(value)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('details')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={12}>
          <Text size={12} color="shy">
            {t('vault_info')}
          </Text>
          <Item>
            <Text size={14}>{t('vault_name')}</Text>
            <Text size={14}>{name}</Text>
          </Item>
          <Item>
            <Text size={14}>{t('vault_part')}</Text>
            <Text
              size={14}
            >{`${t('share')} ${localPartyIndex} ${t('of')} ${totalSigners}`}</Text>
          </Item>
          <Item>
            <Text size={14}>{t('vault_details_page_vault_type')}</Text>
            <Text size={14}>{libType}</Text>
          </Item>
        </VStack>

        <VStack gap={12}>
          <Text size={12} color="shy">
            {t('keys')}
          </Text>
          <Item>
            <TruncatingCol flexGrow>
              <Text size={14}>{t('vault_details_page_vault_ECDSA')}</Text>
              <Text cropped size={12} color="shyExtra">
                {publicKeys.ecdsa}
              </Text>
            </TruncatingCol>
            <UnstyledButton
              onClick={() => handleCopyToClipboard(publicKeys.ecdsa)}
            >
              <IconWrapper size={20}>
                <CopyIcon />
              </IconWrapper>
            </UnstyledButton>
          </Item>
          <Item>
            <TruncatingCol flexGrow>
              <Text size={14}>{t('vault_details_page_vault_EDDSA')}</Text>
              <Text cropped size={12} color="shyExtra">
                {publicKeys.eddsa}
              </Text>
            </TruncatingCol>
            <UnstyledButton
              onClick={() => handleCopyToClipboard(publicKeys.eddsa)}
            >
              <IconWrapper size={20}>
                <CopyIcon />
              </IconWrapper>
            </UnstyledButton>
          </Item>
        </VStack>
        <VStack gap={12}>
          <Text size={12} color="shy">
            {t('m_of_n_vault', { n: totalSigners, m: threshold })}
          </Text>
          {signers.map((signer, index) => (
            <Item
              key={index}
              title={`${t('vault_details_page_signer_word')} ${index + 1}: ${signer}${signer === localPartyId ? ` (${t('this_device')})` : ''}`}
            >
              <Text>
                {`${t('vault_details_page_signer_word')} ${index + 1}: ${signer}${signer === localPartyId ? ` (${t('this_device')})` : ''}`}
              </Text>
              <IconWrapper color="textShy" size={23}>
                <DeviceIcon />
              </IconWrapper>
            </Item>
          ))}
        </VStack>
      </PageContent>
    </VStack>
  )
}

const Item = styled.div`
  padding: 16px;

  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  })};

  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(11, 26, 58, 0.5);
`

const TruncatingCol = styled(VStack)`
  min-width: 0;
`
