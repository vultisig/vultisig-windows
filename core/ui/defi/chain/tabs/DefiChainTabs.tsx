import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Tabs } from '@lib/ui/base/Tabs'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiChainPageTab, getDefiChainTabs } from './config'

export const DefiChainTabs = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<DefiChainPageTab>('bonded')
  const { colors } = useTheme()
  const navigate = useCoreNavigate()
  const chain = useCurrentDefiChain()
  const tabs = useMemo(() => getDefiChainTabs(t), [t])

  return (
    <Tabs
      tabs={tabs}
      value={activeTab}
      onValueChange={setActiveTab}
      triggerSlot={({ tab: { label, disabled }, isActive, ...props }) => (
        <TriggerItem {...props} isActive={isActive} isDisabled={disabled}>
          <Text
            size={14}
            as="span"
            color={isActive ? 'contrast' : 'supporting'}
          >
            {label}
          </Text>
        </TriggerItem>
      )}
      triggersContainer={({ children }) => (
        <TabsHeader>
          <HStack gap={12} alignItems="center">
            {children}
          </HStack>
          <IconButton
            kind="secondary"
            onClick={() =>
              navigate({ id: 'manageDefiPositions', state: { chain } })
            }
            style={{
              color: colors.info.toCssValue(),
            }}
            size="lg"
          >
            <CryptoWalletPenIcon />
          </IconButton>
        </TabsHeader>
      )}
    />
  )
}

export const TabsHeader = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  })};

  margin-bottom: 16px;
`

export const TriggerItem = styled(UnstyledButton)<
  IsActiveProp & IsDisabledProp
>`
  width: fit-content;
  padding-bottom: 6px;
  cursor: pointer;

  ${hStack({
    alignItems: 'center',
    gap: 6,
  })};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-bottom: 1.5px solid ${theme.colors.buttonPrimary.toCssValue()};
    `};

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
    `};
`
