import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { Clone2Icon } from '@lib/ui/icons/Clone2Icon'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getSwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/getSwapQuoteProviderName'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSwapRoutes } from '../../queries/useSwapRoutes'
import { useSwapFromCoin } from '../../state/fromCoin'
import { AdvancedSheet } from './AdvancedSheet'
import { ExternalRecipientSheet } from './ExternalRecipientSheet'
import { GasLimitSheet } from './GasLimitSheet'
import { SelectRouteSheet } from './SelectRouteSheet'
import { formatSlippage, SlippageValue } from './slippage'
import { SlippageSheet } from './SlippageSheet'

type AdvancedSwapSettingsSheetProps = OnCloseProp & {
  slippage: SlippageValue
  onSlippageChange: (value: SlippageValue) => void
  gasLimit: string
  onGasLimitChange: (value: string) => void
  externalRecipient: string
  onExternalRecipientChange: (value: string) => void
}

const shortenAddress = (address: string) =>
  `${address.slice(0, 4)}…${address.slice(-4)}`

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
  externalRecipient,
  onExternalRecipientChange,
}: AdvancedSwapSettingsSheetProps) => {
  const { t } = useTranslation()
  const [fromCoinKey] = useSwapFromCoin()
  const { canSelectRoute, activeRoute, isOverridden } = useSwapRoutes()
  const [openSheet, setOpenSheet] = useState<
    'selectRoute' | 'slippage' | 'gasLimit' | 'externalRecipient' | null
  >(null)

  // A custom gas limit only applies to EVM source transactions (see the
  // `gasLimitOverride` guard in the SDK keysign builder), so the row is hidden
  // for non-EVM swaps where it has no effect.
  const isEvmSwap = isChainOfKind(fromCoinKey.chain, 'evm')

  const rows: SettingRow[] = [
    ...(canSelectRoute
      ? [
          {
            key: 'selectRoute',
            icon: <ArrowSplitIcon />,
            title: t('select_route'),
            value:
              isOverridden && activeRoute
                ? getSwapQuoteProviderName(activeRoute.quote)
                : t('auto'),
            onClick: () => setOpenSheet('selectRoute'),
          },
        ]
      : []),
    {
      key: 'slippage',
      icon: <LightningIcon />,
      title: t('slippage_tolerance'),
      value: formatSlippage(slippage, t('auto')),
      onClick: () => setOpenSheet('slippage'),
    },
    ...(isEvmSwap
      ? [
          {
            key: 'gasLimit',
            icon: <FuelIcon />,
            title: t('gas_limit'),
            value: gasLimit || t('auto'),
            onClick: () => setOpenSheet('gasLimit'),
          },
        ]
      : []),
    {
      key: 'externalRecipient',
      icon: <Clone2Icon />,
      title: t('use_external_recipient'),
      value: externalRecipient ? shortenAddress(externalRecipient) : t('off'),
      onClick: () => setOpenSheet('externalRecipient'),
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
      {openSheet === 'selectRoute' && (
        <SelectRouteSheet onClose={() => setOpenSheet(null)} />
      )}
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
      {openSheet === 'externalRecipient' && (
        <ExternalRecipientSheet
          value={externalRecipient}
          onChange={onExternalRecipientChange}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </AdvancedSheet>
  )
}
