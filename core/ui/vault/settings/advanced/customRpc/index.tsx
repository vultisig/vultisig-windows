import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCustomRpcOverrides } from '@core/ui/storage/customRpcOverrides'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { customRpcSupportedChains } from '@vultisig/core-chain/chains/customRpc/customRpcSupportedChains'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DescriptionText } from '../../vaultSettingsListStyles'

export const CustomRpcPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const overrides = useCustomRpcOverrides()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => navigate({ id: 'vaultSettingsAdvanced' })}
          />
        }
        title={t('custom_rpc')}
      />
      <PageContent gap={14} flexGrow scrollable>
        <Text color="shy" size={12}>
          {t('custom_rpc_list_subtitle')}
        </Text>
        <List>
          {customRpcSupportedChains.map(chain => {
            const customUrl = overrides[chain]

            return (
              <ListItem
                key={chain}
                icon={
                  <ChainEntityIcon
                    value={getChainLogoSrc(chain)}
                    style={{ fontSize: 32 }}
                  />
                }
                title={chain}
                description={
                  customUrl ? (
                    <CustomUrlText>{customUrl}</CustomUrlText>
                  ) : undefined
                }
                extra={
                  <StatusChip isCustom={Boolean(customUrl)}>
                    {customUrl
                      ? t('custom_rpc_chip_custom')
                      : t('custom_rpc_chip_default')}
                  </StatusChip>
                }
                onClick={() =>
                  navigate({ id: 'customRpcDetail', state: { chain } })
                }
                hoverable
                showArrow
              />
            )
          })}
        </List>
      </PageContent>
    </VStack>
  )
}

const CustomUrlText = styled(DescriptionText)`
  display: block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const StatusChip = styled.span<{ isCustom: boolean }>`
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  white-space: nowrap;
  background: ${getColor('mist')};
  color: ${({ isCustom }) =>
    isCustom ? getColor('primaryAlt') : getColor('textShy')};
`
