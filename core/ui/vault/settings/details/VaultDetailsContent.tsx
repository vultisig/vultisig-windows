import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { settingsReadOnlySurface } from '@core/ui/settings/settingsField'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CopiesFilledIcon } from '@lib/ui/icons/CopiesFilledIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LaptopMobileIcon } from '@lib/ui/icons/LaptopMobileIcon'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getKeygenThreshold } from '@vultisig/core-mpc/getKeygenThreshold'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Item = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  })};
  ${borderRadius.md};
  ${settingsReadOnlySurface};
  min-height: 66px;
  padding: 15px 19px;
`

// Title and key come to 37, which the frame's fixed 66 row centers instead of padding.
const KeyItem = styled(Item)`
  padding-block: 13px 14px;
`

const TruncatingCol = styled(VStack)`
  gap: 4px;
  min-width: 0;
`

const CopyButton = styled(UnstyledButton)`
  color: ${getColor('textShyExtra')};
  --icon-accent: currentColor;

  path {
    stroke-width: 2;
  }
`

const SignerGrid = styled.div`
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`

const SignerCard = styled.div`
  ${hStack({ alignItems: 'center', gap: 8 })};
  ${borderRadius.lg};
  ${settingsReadOnlySurface};
  min-width: 0;
  padding: 15px;
`

const SignerText = styled(VStack)`
  flex: 1;
  gap: 2px;
  min-width: 0;
  overflow-wrap: anywhere;
`

type RowProps = { label: string; value: string }

const Row = ({ label, value }: RowProps) => (
  <Item>
    <SettingsBaselineText variant="stationBodyS">{label}</SettingsBaselineText>
    <SettingsBaselineText variant="stationBodyS">{value}</SettingsBaselineText>
  </Item>
)

const KeyRow = ({ label, value }: RowProps) => (
  <KeyItem>
    <TruncatingCol flexGrow>
      <SettingsBaselineText variant="subtitle">{label}</SettingsBaselineText>
      <Text cropped color="shy" variant="caption">
        {value}
      </Text>
    </TruncatingCol>
    <CopyButton onClick={() => navigator.clipboard.writeText(value)}>
      <IconWrapper size={20}>
        <CopiesFilledIcon />
      </IconWrapper>
    </CopyButton>
  </KeyItem>
)

export const VaultDetailsContent = () => {
  const { t } = useTranslation()
  const { name, publicKeys, publicKeyMldsa, signers, localPartyId, libType } =
    useCurrentVault()
  const totalSigners = signers.length
  const localPartyIndex = signers.indexOf(localPartyId) + 1
  const threshold = getKeygenThreshold(totalSigners)

  return (
    <>
      <VStack gap={12}>
        <Text color="shy" variant="caption">
          {t('vault_info')}
        </Text>
        <Row label={t('vault_name')} value={name} />
        <Row
          label={t('vault_part')}
          value={t('vault_share_position', {
            index: localPartyIndex,
            total: totalSigners,
          })}
        />
        <Row label={t('vault_details_page_vault_type')} value={libType} />
      </VStack>

      <VStack gap={12}>
        <Text color="shy" variant="caption">
          {t('keys')}
        </Text>
        <KeyRow
          label={t('vault_delete_page_ecdsa_key')}
          value={publicKeys.ecdsa}
        />
        <KeyRow
          label={t('vault_delete_page_eddsa_key')}
          value={publicKeys.eddsa}
        />
        {publicKeyMldsa && (
          <KeyRow
            label={t('vault_details_page_vault_MLDSA')}
            value={publicKeyMldsa}
          />
        )}
      </VStack>
      <VStack gap={12}>
        <Text color="shy" variant="caption">
          {t('m_of_n_vault', { n: totalSigners, m: threshold })}
        </Text>
        <SignerGrid>
          {signers.map((signer, index) => {
            const signerLabel = `${t('vault_details_page_signer_word')} ${index + 1}`
            const isThisDevice = signer === localPartyId

            return (
              <SignerCard
                key={index}
                title={`${signerLabel}: ${signer}${isThisDevice ? ` (${t('this_device')})` : ''}`}
              >
                <SignerText>
                  <SettingsBaselineText color="shyExtra" variant="footnote">
                    {signerLabel}
                  </SettingsBaselineText>
                  <SettingsBaselineText
                    color="contrast"
                    height={18 / 14}
                    size={14}
                    weight={500}
                  >
                    {signer}
                  </SettingsBaselineText>
                  {isThisDevice && (
                    <SettingsBaselineText color="shyExtra" variant="footnote">
                      {t('this_device')}
                    </SettingsBaselineText>
                  )}
                </SignerText>
                <IconWrapper color="textShy" size={23}>
                  <LaptopMobileIcon />
                </IconWrapper>
              </SignerCard>
            )
          })}
        </SignerGrid>
      </VStack>
    </>
  )
}
