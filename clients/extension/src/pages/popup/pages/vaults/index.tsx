import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import {
  StyledActiveVault,
  StyledActiveVaultIcon,
  StyledActiveVaultName,
  StyledDevices,
  StyledList,
  StyledListItem,
} from '@clients/extension/src/pages/popup/pages/vaults/styles'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Button } from '@lib/ui/buttons/Button'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  vault?: VaultProps
  vaults: VaultProps[]
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { vault, vaults } = state
  const navigate = useAppNavigate()

  const handleSelect = (uid: string) => {
    setStoredVaults(
      vaults.map(vault => ({ ...vault, active: vault.uid === uid }))
    ).then(() => {
      navigate('main')
    })
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      setState(prevState => ({ ...prevState, vault, vaults }))
    })
  }

  useEffect(componentDidMount, [])

  return vault ? (
    <>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderIconButton
            onClick={() => navigate('settings')}
            icon={<ChevronLeftIcon />}
          />
        }
        title={<PageHeaderTitle>{t('choose_vault')}</PageHeaderTitle>}
      />
      <PageContent gap={20} scrollable>
        {vault && (
          <StyledActiveVault>
            <StyledActiveVaultName>{vault.name}</StyledActiveVaultName>
            <StyledActiveVaultIcon>{t('active')}</StyledActiveVaultIcon>
          </StyledActiveVault>
        )}
        {vaults.length > 1 && (
          <VStack gap={12}>
            <Text weight={500} size={12} color="contrast">
              {t('other_vaults')}
            </Text>
            <StyledList gap={1}>
              {vaults
                .filter(({ uid }) => uid !== vault.uid)
                .map(({ name, uid }) => (
                  <StyledListItem
                    key={uid}
                    onClick={() => handleSelect(uid)}
                    gap={12}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack
                      gap={12}
                      flexGrow
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text weight={500} size={14} color="contrast" cropped>
                        {name}
                      </Text>
                      <StyledDevices
                        nowrap
                        size={12}
                        weight={500}
                        color="supporting"
                      >
                        {t('share_n_of_m', { n: 2, m: 3 })}
                      </StyledDevices>
                    </HStack>
                    <HStack>
                      <ChevronRightIcon size={16} />
                    </HStack>
                  </StyledListItem>
                ))}
            </StyledList>
          </VStack>
        )}
        <Button
          onClick={() =>
            navigate('importQR', {
              params: {
                title: t('import_vault'),
              },
            })
          }
          kind="primary"
        >
          {t('add_new_vault')}
        </Button>
      </PageContent>
    </>
  ) : (
    <></>
  )
}

export default Component
