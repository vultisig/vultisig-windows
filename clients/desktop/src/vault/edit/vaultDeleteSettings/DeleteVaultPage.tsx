import { fiatCurrencySymbolRecord } from '@core/config/FiatCurrency'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import DangerSignRedIcon from '@lib/ui/icons/DangerSignRedIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDeleteVaultMutation } from '../../../vault/mutations/useDeleteVaultMutation'
import { useVaultTotalBalanceQuery } from '../../../vault/queries/useVaultTotalBalanceQuery'
import { getVaultParticipantInfoFormattedForUI } from '../../../vault/utils/helpers'
import {
  ActionsWrapper,
  Check,
  Container,
  DeleteButton,
  ListItemPanel,
} from './DeleteVaultPage.styles'

type DeleteTerms = {
  firstTermAccepted: boolean
  secondTermAccepted: boolean
  thirdTermAccepted: boolean
}

const getDeleteTermsConfig = (t: TFunction) => [
  { key: 'firstTermAccepted' as const, label: t('vault_delete_page_term_1') },
  { key: 'secondTermAccepted' as const, label: t('vault_delete_page_term_2') },
  { key: 'thirdTermAccepted' as const, label: t('vault_delete_page_term_3') },
]

const DeleteVaultPage = () => {
  const [deleteTerms, setDeleteTerms] = useState<DeleteTerms>({
    firstTermAccepted: false,
    secondTermAccepted: false,
    thirdTermAccepted: false,
  })

  const { t } = useTranslation()
  const { data: vaultBalance } = useVaultTotalBalanceQuery()
  const { mutate: deleteVault, isPending, error } = useDeleteVaultMutation()
  const vault = useCurrentVault()
  const fiatCurrency = useFiatCurrency()

  const { signers, name, publicKeys, localPartyId } = vault

  const { localPartyIndex, totalSigners } =
    getVaultParticipantInfoFormattedForUI({
      signers,
      localPartyId,
    })

  const currencySymbol = fiatCurrencySymbolRecord[fiatCurrency]

  const vaultDetails = [
    { label: t('vault_name'), value: name },
    {
      label: t('vault_value'),
      value: vaultBalance + ' ' + currencySymbol,
    },
    {
      label: t('vault_part'),
      value: `${t('share')} ${localPartyIndex} ${t('of')} ${totalSigners}`,
    },
    { label: t('vault_delete_page_device_id'), value: localPartyId },
    { label: t('vault_delete_page_ecdsa_key'), value: publicKeys.ecdsa },
    { label: t('vault_delete_page_eddsa_key'), value: publicKeys.eddsa },
  ]

  const deleteTermsConfig = getDeleteTermsConfig(t)

  const toggleDeleteTerm = (key: keyof DeleteTerms) => {
    setDeleteTerms(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const isDeleteDisabled = !Object.values(deleteTerms).every(Boolean)

  const navigate = useCoreNavigate()

  return (
    <Container flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_delete_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={32} flexGrow>
        <VStack gap={16} justifyContent="center" alignItems="center">
          <DangerSignRedIcon />
          <Text size={16} color="contrast" weight="700">
            {t('vault_delete_page_header_subtitle')}
          </Text>
        </VStack>

        <VStack flexGrow justifyContent="space-between">
          <ListItemPanel>
            <VStack gap={10}>
              <Text size={22} weight={600}>
                {t('details')}:
              </Text>
              {vaultDetails.map(({ label, value }, index) => (
                <HStack key={index} gap={8}>
                  <Text weight={600}>{label}:</Text>
                  <Text
                    size={14}
                    color={
                      index === vaultDetails.length - 1 ||
                      index === vaultDetails.length - 2
                        ? 'shy'
                        : undefined
                    }
                  >
                    {value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </ListItemPanel>

          <VStack>
            <ActionsWrapper gap={16}>
              {deleteTermsConfig.map(({ key, label }) => (
                <HStack
                  key={key}
                  onClick={() => toggleDeleteTerm(key)}
                  role="button"
                  tabIndex={0}
                  alignItems="center"
                  gap={8}
                >
                  <Check value={deleteTerms[key]} />
                  <Text as="span" color="contrast">
                    {label}
                  </Text>
                </HStack>
              ))}
            </ActionsWrapper>
            <DeleteButton
              isLoading={isPending}
              onClick={() => {
                deleteVault(getVaultId(vault), {
                  onSuccess: () => navigate('vault'),
                })
              }}
              isDisabled={isDeleteDisabled}
            >
              {t('delete')}
            </DeleteButton>
            {error && (
              <Text size={12} color="danger">
                {error?.message}
              </Text>
            )}
          </VStack>
        </VStack>
      </PageSlice>
    </Container>
  )
}

export default DeleteVaultPage
