import { fiatCurrencySymbolRecord } from '@core/config/FiatCurrency'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useDeleteVaultMutation } from '@core/ui/storage/vaults'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { Divider } from '@lib/ui/divider'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { CheckStatus } from '@lib/ui/inputs/checkbox/CheckStatus'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledCheck = styled(CheckStatus)`
  ${sameDimensions(14)};
`

const StyledIcon = styled(TriangleAlertIcon)`
  color: ${getColor('alertError')};
`

interface InitialState {
  firstTermAccepted: boolean
  secondTermAccepted: boolean
  thirdTermAccepted: boolean
}

export const DeleteVaultPage = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    firstTermAccepted: false,
    secondTermAccepted: false,
    thirdTermAccepted: false,
  }
  const [state, setState] = useState(initialState)
  const { firstTermAccepted, secondTermAccepted, thirdTermAccepted } = state
  const { data: vaultBalance } = useVaultTotalBalanceQuery()
  const { mutate: deleteVault, isPending, error } = useDeleteVaultMutation()
  const navigate = useCoreNavigate()
  const currency = useFiatCurrency()
  const vault = useCurrentVault()
  const isDisabled = !Object.values(state).every(Boolean)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_delete_page_header_title')}
          </PageHeaderTitle>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack alignItems="center" gap={24}>
          <StyledIcon fontSize={66} />
          <Text color="contrast" size={16} weight={700} centerHorizontally>
            {t('vault_delete_page_header_subtitle')}
          </Text>
        </VStack>
        <List>
          <ListItem title={t('vault_name')} description={vault.name} />
          <ListItem
            title={t('vault_value')}
            description={`${vaultBalance} ${fiatCurrencySymbolRecord[currency]}`}
          />
          <ListItem
            title={t('vault_part')}
            description={`${t('share')} ${vault.signers.indexOf(vault.localPartyId) + 1} ${t('of')} ${vault.signers.length}`}
          />
          <ListItem
            title={t('vault_details_page_vault_type')}
            description={vault.libType}
          />
          <ListItem
            title={t('vault_details_page_vault_ECDSA')}
            description={vault.publicKeys.ecdsa}
          />
          <ListItem
            title={t('vault_details_page_vault_EDDSA')}
            description={vault.publicKeys.eddsa}
          />
        </List>
        <Divider text={t('terms')} />
        <List>
          <ListItem
            extra={<StyledCheck value={firstTermAccepted} />}
            onClick={() =>
              setState(prevState => ({
                ...prevState,
                firstTermAccepted: !prevState.firstTermAccepted,
              }))
            }
            title={t('vault_delete_page_term_1')}
            hoverable
          />
          <ListItem
            extra={<StyledCheck value={secondTermAccepted} />}
            onClick={() =>
              setState(prevState => ({
                ...prevState,
                secondTermAccepted: !prevState.secondTermAccepted,
              }))
            }
            title={t('vault_delete_page_term_2')}
            hoverable
          />
          <ListItem
            extra={<StyledCheck value={thirdTermAccepted} />}
            onClick={() =>
              setState(prevState => ({
                ...prevState,
                thirdTermAccepted: !prevState.thirdTermAccepted,
              }))
            }
            title={t('vault_delete_page_term_3')}
            hoverable
          />
        </List>
        {error && (
          <Text color="danger" size={12}>
            {error?.message}
          </Text>
        )}
      </PageContent>
      <PageFooter>
        <Button
          isDisabled={isDisabled}
          isLoading={isPending}
          kind="alert"
          onClick={() => {
            if (!isDisabled && !isPending) {
              deleteVault(getVaultId(vault), {
                onSuccess: () => navigate({ id: 'vault' }),
              })
            }
          }}
        >
          {t('delete')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
