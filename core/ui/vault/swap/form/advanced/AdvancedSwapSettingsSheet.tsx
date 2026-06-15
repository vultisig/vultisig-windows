import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ExternalRecipientIcon } from './icons/ExternalRecipientIcon'
import { GasLimitIcon } from './icons/GasLimitIcon'
import { SlippageIcon } from './icons/SlippageIcon'

type SettingRow = {
  key: string
  icon: ReactNode
  title: string
  value: string
}

export const AdvancedSwapSettingsSheet = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()

  const rows: SettingRow[] = [
    {
      key: 'slippage',
      icon: <SlippageIcon />,
      title: t('slippage_tolerance'),
      value: t('auto'),
    },
    {
      key: 'gasLimit',
      icon: <GasLimitIcon />,
      title: t('gas_limit'),
      value: t('auto'),
    },
    {
      key: 'externalRecipient',
      icon: <ExternalRecipientIcon />,
      title: t('use_external_recipient'),
      value: t('off'),
    },
  ]

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      modalProps={{ withDefaultStructure: false }}
    >
      <Wrapper gap={20}>
        <HStack alignItems="center" justifyContent="space-between" gap={12}>
          <IconButton kind="secondary" size="lg" onClick={onClose}>
            <CrossIcon />
          </IconButton>
          <Text
            size={16}
            weight={500}
            color="contrast"
            style={{ flex: 1, textAlign: 'center' }}
          >
            {t('advanced_swap')}
          </Text>
          <IconButton kind="primary" size="lg" onClick={onClose}>
            <CheckIcon />
          </IconButton>
        </HStack>
        <List border="solid">
          {rows.map(({ key, icon, title, value }) => (
            <ListItem
              key={key}
              hoverable={false}
              icon={
                <IconWrapper size={20} color="textShyExtra">
                  {icon}
                </IconWrapper>
              }
              title={title}
              styles={{ title: { color: 'textShyExtra', fontSize: 14 } }}
              extra={
                <HStack alignItems="center" gap={8}>
                  <Text size={14} color="regular">
                    {value}
                  </Text>
                  <IconWrapper size={16} color="text">
                    <ChevronRightIcon />
                  </IconWrapper>
                </HStack>
              }
            />
          ))}
        </List>
      </Wrapper>
    </ResponsiveModal>
  )
}

const Wrapper = styled(VStack)`
  width: 100%;
  background: ${getColor('background')};
  ${borderRadius.m};
  padding: 20px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(420px, 100% - 32px);
  }
`
