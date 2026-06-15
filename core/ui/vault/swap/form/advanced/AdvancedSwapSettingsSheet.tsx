import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdvancedSheet } from './AdvancedSheet'
import { GasLimitSheet } from './GasLimitSheet'
import { ExternalRecipientIcon } from './icons/ExternalRecipientIcon'
import { GasLimitIcon } from './icons/GasLimitIcon'
import { SlippageIcon } from './icons/SlippageIcon'
import { formatSlippage, SlippageValue } from './slippage'
import { SlippageSheet } from './SlippageSheet'

type AdvancedSwapSettingsSheetProps = OnCloseProp & {
  slippage: SlippageValue
  onSlippageChange: (value: SlippageValue) => void
  gasLimit: string
  onGasLimitChange: (value: string) => void
}

type SettingRow = {
  key: string
  icon: ReactNode
  title: string
  value: string
  onClick?: () => void
}

export const AdvancedSwapSettingsSheet = ({
  onClose,
  slippage,
  onSlippageChange,
  gasLimit,
  onGasLimitChange,
}: AdvancedSwapSettingsSheetProps) => {
  const { t } = useTranslation()
  const [openSheet, setOpenSheet] = useState<'slippage' | 'gasLimit' | null>(
    null
  )

  const rows: SettingRow[] = [
    {
      key: 'slippage',
      icon: <SlippageIcon />,
      title: t('slippage_tolerance'),
      value: formatSlippage(slippage, t('auto')),
      onClick: () => setOpenSheet('slippage'),
    },
    {
      key: 'gasLimit',
      icon: <GasLimitIcon />,
      title: t('gas_limit'),
      value: gasLimit || t('auto'),
      onClick: () => setOpenSheet('gasLimit'),
    },
    {
      key: 'externalRecipient',
      icon: <ExternalRecipientIcon />,
      title: t('use_external_recipient'),
      value: t('off'),
    },
  ]

  return (
    <AdvancedSheet title={t('advanced_swap')} onClose={onClose}>
      <List border="solid">
        {rows.map(({ key, icon, title, value, onClick }) => (
          <ListItem
            key={key}
            hoverable={!!onClick}
            onClick={onClick}
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
      {openSheet === 'slippage' && (
        <SlippageSheet
          value={slippage}
          onChange={onSlippageChange}
          onClose={() => setOpenSheet(null)}
        />
      )}
      {openSheet === 'gasLimit' && (
        <GasLimitSheet
          value={gasLimit}
          onChange={onGasLimitChange}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </AdvancedSheet>
  )
}
