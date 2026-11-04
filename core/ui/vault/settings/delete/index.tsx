import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsCheckbox } from '@core/ui/settings/SettingsCheckbox'
import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { settingsReadOnlySurface } from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useDeleteVaultMutation, useVaults } from '@core/ui/storage/vaults'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TriangleWarningFilledIcon } from '@lib/ui/icons/TriangleWarningFilledIcon'
import { HStack, hStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const terms = [
  'vault_delete_page_term_1',
  'vault_delete_page_term_2',
  'vault_delete_page_term_3',
] as const

export const DeleteVaultPage = () => {
  const { t } = useTranslation()
  const [termsAccepted, setTermsAccepted] = useState(terms.map(() => false))
  const { data: vaultBalance } = useVaultTotalBalanceQuery()
  const navigate = useCoreNavigate()
  const formatFiatAmount = useFormatFiatAmount()
  const vault = useCurrentVault()
  const vaults = useVaults()
  const isLastVault = vaults.length <= 1
  const {
    mutate: deleteVault,
    isPending,
    error,
  } = useDeleteVaultMutation({
    onSuccess: () => navigate({ id: isLastVault ? 'newVault' : 'vaults' }),
  })
  const isDisabled = !termsAccepted.every(Boolean)

  const handleConfirm = () => {
    if (!isDisabled && !isPending) {
      deleteVault(getVaultId(vault))
    }
  }

  const toggleCheckbox = (index: number) => {
    setTermsAccepted(prev =>
      prev.map((value, i) => (i === index ? !value : value))
    )
  }

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('vault_delete_page_header_title')} />
      <Content gap={14} flexGrow scrollable>
        <VStack alignItems="center" gap={14}>
          <IconWrapper size={24} color="danger">
            <TriangleWarningFilledIcon />
          </IconWrapper>
          <VStack alignItems="center" gap={8}>
            <SettingsBaselineText
              color="danger"
              height={24 / 22}
              letterSpacing={-0.36}
              size={22}
              weight={500}
              centerHorizontally
            >
              {t('vault_delete_page_header_title')}
            </SettingsBaselineText>
            <Subtitle color="shy" variant="footnote" centerHorizontally>
              {t('vault_delete_page_header_subtitle')}
            </Subtitle>
          </VStack>
        </VStack>
        <VStack gap={12}>
          <Item>
            <ItemText variant="footnote">{t('vault_name')}:</ItemText>
            <ItemValue variant="stationBodyS">{vault.name}</ItemValue>
          </Item>
          <Item>
            <ItemText variant="footnote">{t('vault_value')}:</ItemText>
            <ItemValue variant="stationBodyS">
              {vaultBalance !== undefined && formatFiatAmount(vaultBalance)}
            </ItemValue>
          </Item>

          <HStack gap={12} alignItems="start">
            <VItem>
              <ItemText color="shyExtra" variant="footnote">
                {t('vault_delete_page_vault_part')}:
              </ItemText>
              <ItemText variant="footnote">
                {t('vault_share_position', {
                  index: vault.signers.indexOf(vault.localPartyId) + 1,
                  total: vault.signers.length,
                })}
              </ItemText>
            </VItem>
            <VItem>
              <ItemText color="shyExtra" variant="footnote">
                {t('vault_delete_page_device_id')}:
              </ItemText>
              <ItemText variant="footnote">{vault.localPartyId}</ItemText>
            </VItem>
          </HStack>
          <HStack gap={12} alignItems="start">
            <VItem>
              <ItemText variant="footnote">
                {t('vault_delete_page_ecdsa_key')}:
              </ItemText>
              <Text color="shy" variant="caption">
                {vault.publicKeys.ecdsa}
              </Text>
            </VItem>
            <VItem>
              <ItemText variant="footnote">
                {t('vault_delete_page_eddsa_key')}:
              </ItemText>
              <Text color="shy" variant="caption">
                {vault.publicKeys.eddsa}
              </Text>
            </VItem>
          </HStack>
        </VStack>
        <Terms data-testid="delete-vault-terms">
          {terms.map((term, index) => (
            <SettingsCheckbox
              key={index}
              onChange={() => toggleCheckbox(index)}
              label={t(term)}
              value={termsAccepted[index]}
              data-testid={`delete-confirm-${index + 1}`}
            />
          ))}
        </Terms>
        {error?.message && (
          <Text color="danger" size={12}>
            {error.message}
          </Text>
        )}
      </Content>
      <Footer>
        <DeleteButton
          disabled={isDisabled}
          loading={isPending}
          onClick={handleConfirm}
          status="danger"
          data-testid="delete-vault-button"
        >
          {t('vault_delete_page_button')}
        </DeleteButton>
      </Footer>
    </VStack>
  )
}

const Content = styled(SettingsPageContent)`
  padding-bottom: 0;
`

const Footer = styled(SettingsPageFooter)`
  padding-top: 14px;
`

const Subtitle = styled(SettingsBaselineText)`
  max-width: 283px;
`

const Item = styled.div`
  ${hStack({
    alignItems: 'center',
    gap: 12,
  })};
  ${borderRadius.lg};
  ${settingsReadOnlySurface};
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 19px;
`

const VItem = styled.div`
  ${vStack({ gap: 2 })};
  ${borderRadius.lg};
  ${settingsReadOnlySurface};
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 15px 19px;
`

const ItemText = styled(SettingsBaselineText)`
  flex: 1;
  min-width: 0;
`

const ItemValue = styled(ItemText)`
  text-align: right;
`

const Terms = styled.div`
  ${vStack({ gap: 2 })};
  padding-top: 8px;

  > :first-child {
    min-height: 32px;
  }
`

const DeleteButton = styled(SettingsCtaButton)`
  box-shadow: none;
  font-weight: 600;
`
